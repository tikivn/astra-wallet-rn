import React, { FunctionComponent, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { observer } from "mobx-react-lite";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { useNewMnemonicConfig } from "./hook";
import { PageWithScrollView } from "../../../components/page";
import { useStyle } from "../../../styles";
import { WordChip } from "../../../components/mnemonic";
import { Button } from "../../../components/button";
import Clipboard from "expo-clipboard";

import { useForm } from "react-hook-form";
import { useSmartNavigation } from "../../../navigation-util";
import { useBIP44Option } from "../bip44";

import { AlertInline } from "../../../components";
import { useIntl } from "react-intl";
import { useToastModal } from "../../../providers/toast-modal";

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
  const intl = useIntl();

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
      <Text
        style={style.flatten([
          "text-x-large-semi-bold",
          "color-gray-10",
          "margin-top-24",
          "margin-bottom-4",
          "text-center",
        ])}
      >
        {intl.formatMessage({ id: "register.text.backupMnemonic" })}
      </Text>
      <WordsCard words={words} />
      <View style={style.flatten(["flex-1"])} />
      <AlertInline
        type="warning"
        title={intl.formatMessage({
          id: "common.alert.title.notShareMnemonic",
        })}
        content={intl.formatMessage({
          id: "common.alert.content.notShareMnemonic",
        })}
      />
      <View style={style.flatten(["height-16"])} />
      <Button
        text={intl.formatMessage({ id: "common.text.continue" })}
        onPress={submit}
      />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});

const WordsCard: FunctionComponent<{
  words: string[];
}> = ({ words }) => {
  const style = useStyle();
  const toast = useToastModal();
  /*
    On IOS, user can peek the words by right side gesture from the verifying mnemonic screen.
    To prevent this, hide the words if the screen lost the focus.
   */
  const [hideWord, setHideWord] = useState(false);
  const isFocused = useIsFocused();
  const intl = useIntl();
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
          "words-container",
          "flex-row",
          "flex-wrap",
          "justify-center",
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
          textStyle={style.flatten(["subtitle3", "color-primary"])}
          mode="text"
          text={intl.formatMessage({ id: "component.text.copy" })}
          onPress={() => {
            Clipboard.setString(words.join(" "));
            toast.makeToast({
              title: intl.formatMessage({ id: "seedphrase.copied" }),
              type: "success",
            });
          }}
        />
      </View>
    </React.Fragment>
  );
};
