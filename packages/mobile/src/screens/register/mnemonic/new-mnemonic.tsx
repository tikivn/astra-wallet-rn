import React, { Fragment, FunctionComponent, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { observer } from "mobx-react-lite";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useNewMnemonicConfig } from "./hook";
import { PageWithScrollView } from "../../../components/page";
import { CheckIcon } from "../../../components/icon";
import { useStyle } from "../../../styles";
import { WordChip } from "../../../components/mnemonic";
import { Button } from "../../../components/button";
import Clipboard from "expo-clipboard";
import { TextInput } from "../../../components/input";
import { Controller, useForm } from "react-hook-form";
import { useSmartNavigation } from "../../../navigation";
import { useSimpleTimer } from "../../../hooks";
import { BIP44AdvancedButton, useBIP44Option } from "../bip44";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const NewMnemonicScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig: RegisterConfig = route.params.registerConfig;
  const bip44Option = useBIP44Option();

  const newMnemonicConfig = useNewMnemonicConfig(registerConfig);

  const words = newMnemonicConfig.mnemonic.split(" ");

  const {
    control,
    handleSubmit,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<FormData>();

  const submit = handleSubmit(() => {
    smartNavigation.navigateSmart("Register.VerifyMnemonic", {
      registerConfig,
      newMnemonicConfig,
      bip44HDPath: bip44Option.bip44HDPath,
    });
  });

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page"])}
    >
      {/* Mock for flexible margin top */}
      <View style={style.flatten(["max-height-64", "flex"])} />
      <Text
        style={style.flatten([
          "h4",
          "color-text-gray",
          "margin-bottom-4",
          "text-center",
        ])}
      >
        Sao lưu bằng cụm từ bí mật
      </Text>
      <Text
        style={style.flatten([
          "text-caption",
          "color-text-black-low",
          "margin-bottom-4",
        ])}
      >
        Vui lòng ghi hoặc sao chép chuỗi 12 từ bên dưới và lưu trữ lại ở một nơi an toàn.
      </Text>
      <WordsCard words={words} />
      <View style={style.flatten(["flex-1"])} />
      <View style={style.flatten(["background-color-orange-30", "border-radius-8", "flex-row", "padding-12"])}>
        <View style={style.flatten(["width-20", "height-20", "margin-right-12"])}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <G clipPath="url(#clip0_1919_13808)">
              <Path fillRule="evenodd" clipRule="evenodd" d="M10 6.87501C10.3452 6.87501 10.625 7.15484 10.625 7.50001V11.25C10.625 11.5952 10.3452 11.875 10 11.875C9.65485 11.875 9.37502 11.5952 9.37502 11.25V7.50001C9.37502 7.15484 9.65485 6.87501 10 6.87501Z" fill="#FC820A" />
              <Path fill-rule="evenodd" clipRule="evenodd" d="M8.33768 3.71002C9.03868 2.36643 10.9614 2.36644 11.6624 3.71002L17.1003 14.1327C17.7516 15.381 16.8459 16.875 15.4379 16.875H4.5621C3.1541 16.875 2.24846 15.381 2.89976 14.1327L8.33768 3.71002ZM10.5541 4.28823C10.3205 3.84037 9.67957 3.84037 9.44591 4.28823L4.00799 14.7109C3.79089 15.127 4.09277 15.625 4.5621 15.625H15.4379C15.9073 15.625 16.2092 15.127 15.9921 14.7109L10.5541 4.28823Z" fill="#FC820A" />
              <Path d="M10 14.375C10.5178 14.375 10.9375 13.9553 10.9375 13.4375C10.9375 12.9197 10.5178 12.5 10 12.5C9.48226 12.5 9.06252 12.9197 9.06252 13.4375C9.06252 13.9553 9.48226 14.375 10 14.375Z" fill="#FC820A" />
            </G>
            <Defs>
              <ClipPath id="clip0_1919_13808">
                <Rect width="15" height="15" fill="white" transform="translate(2.5 2.5)" />
              </ClipPath>
            </Defs>
          </Svg>
        </View>
        <Text lineBreakMode="tail" style={style.flatten(["flex-1", "body3", "color-gray-90"])}>Không chia sẻ cụm từ bí mật cho người khác. Nếu ai đó biết chuỗi mật mã, họ sẽ kiểm soát được ví của bạn.</Text>
      </View>
      <View style={style.flatten(["height-24"])} />
      <Button
        containerStyle={style.flatten(["border-radius-4", "background-color-primary", "height-44"])}
        textStyle={style.flatten(["subtitle2"])}
        text="Tiếp tục"
        size="large"
        onPress={submit} />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});

const WordsCard: FunctionComponent<{
  words: string[];
}> = ({ words }) => {
  const style = useStyle();
  const { isTimedOut, setTimer } = useSimpleTimer();

  /*
    On IOS, user can peek the words by right side gesture from the verifying mnemonic screen.
    To prevent this, hide the words if the screen lost the focus.
   */
  const [hideWord, setHideWord] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setHideWord(false);
    } else {
      const timeout = setTimeout(() => {
        setHideWord(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isFocused]);

  return (
    <React.Fragment>
      <View
        style={style.flatten([
          "margin-top-14",
          "margin-bottom-4",
          "padding-top-16",
          "padding-left-16",
          "background-color-background-secondary",
          "border-radius-8",
          "flex-row",
          "flex-wrap",
        ])}
      >
        {words.map((word, i) => {
          return (
            <WordChip
              key={i.toString()}
              index={i + 1}
              word={word}
              hideWord={hideWord}
            />
          );
        })}
      </View>
      <View style={style.flatten(["width-full"])}>
        <Button
          textStyle={style.flatten([
            "subtitle3", "color-primary",
          ])}
          mode="text"
          text={isTimedOut ? "Đã sao chép" : "Sao chép"}
          onPress={() => {
            Clipboard.setString(words.join(" "));
            setTimer(3000);
          }}
        />
      </View>
    </React.Fragment>
  );
};
