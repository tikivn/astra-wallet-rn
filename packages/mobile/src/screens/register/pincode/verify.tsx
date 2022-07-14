import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View, Image } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../../navigation-util";
import { NewMnemonicConfig } from "../mnemonic";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { BIP44HDPath } from "@keplr-wallet/background";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  CodeField,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { useIntl } from "react-intl";

export const VerifyPincodeScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          newMnemonicConfig: NewMnemonicConfig;
          bip44HDPath: BIP44HDPath;
          password: string;
          type: "new" | "restore";
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const registerConfig = route.params.registerConfig;
  const newMnemonicConfig = route.params.newMnemonicConfig;

  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const cellCount = 6;

  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: cellCount });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const password = route.params.password;
  const intl = useIntl();
  const onCreate = async () => {
    if (confirmPassword === password) {
      setIsCreating(true);
      await registerConfig.createMnemonic(
        newMnemonicConfig.name,
        newMnemonicConfig.mnemonic,
        confirmPassword,
        route.params.bip44HDPath
      );

      smartNavigation.reset({
        index: 0,
        routes: [
          {
            name: "Register.End",
            params: {
              password: confirmPassword,
            },
          },
        ],
      });
    } else {
      setIsFailed(true);
    }
  };

  return (
    <React.Fragment>
      <View
        style={style.flatten(["absolute-fill", "background-color-background"])}
      />
      <View style={style.flatten(["flex-1", "background-color-transparent"])}>
        <KeyboardAwareScrollView
          contentContainerStyle={style.flatten([
            "flex-grow-1",
            "padding-x-page",
          ])}
        >
          <View style={style.flatten(["margin-y-32", "items-center"])}>
            {route.params.type === "new" ? (
              <Image
                style={style.flatten(["height-16"])}
                source={require("../../../assets/image/step-3.png")}
                resizeMode="contain"
              />
            ) : null}
          </View>
          <Text
            style={style.flatten([
              "color-white",
              "h4",
              "text-center",
              "margin-bottom-12",
            ])}
          >
            Xác nhận lại mật khẩu truy cập
          </Text>

          <View>
            <Text style={style.flatten(["color-gray-30", "text-caption"])}>
              Đây là mật khẩu để truy cập vào Astra Hub, khác với mật khẩu đăng
              nhập vào Tiki.
            </Text>
            <CodeField
              ref={ref}
              {...props}
              // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setIsFailed(false);
              }}
              cellCount={cellCount}
              rootStyle={style.flatten(["flex-1", "padding-20"])}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <View
                  style={style.flatten(
                    [
                      "items-center",
                      "overflow-hidden",
                      "background-color-gray-80",
                      "width-42",
                      "height-42",
                      "border-width-1",
                      "border-color-gray-80",
                      "border-radius-6",
                    ],
                    [
                      isFocused && "border-color-white",
                      isFailed && "border-color-danger",
                    ]
                  )}
                  key={`code-field.cell_${index}`}
                >
                  <Text
                    key={index}
                    style={style.flatten(["text-center", "h2", "color-white"])}
                    onLayout={getCellOnLayoutHandler(index)}
                  >
                    {symbol ? "•" : null}
                  </Text>
                </View>
              )}
            />
            <Text style={style.flatten(["color-danger", "text-caption2"])}>
              {isFailed ? "Mật khẩu không đúng, vui lòng nhập lại" : null}
            </Text>
          </View>
          <View style={style.get("flex-1")} />
          <Button
            containerStyle={style.flatten(["border-radius-4", "height-44"])}
            textStyle={style.flatten(["subtitle2"])}
            text={intl.formatMessage({ id: "common.text.verify" })}
            size="large"
            loading={isCreating}
            onPress={onCreate}
            disabled={confirmPassword.length < 6}
          />
          <View style={style.get("flex-5")} />
        </KeyboardAwareScrollView>
      </View>
    </React.Fragment>
  );
});
