import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Platform, Text, View } from "react-native";
import { BIOMETRY_TYPE } from "react-native-keychain";
import { Button } from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { NormalInput } from "../../../components/input/normal-input";
import { registerModal } from "../../../modals/base";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const EnableBiometricsModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  value?: string;
}> = registerModal(({ close }) => {
  const style = useStyle();
  const intl = useIntl();

  const { keychainStore } = useStore();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");

  const enableBiometrics = async () => {
    try {
      if (keychainStore.isBiometryOn) {
        await keychainStore.disableBiometrics();
      } else {
        await keychainStore.enableBiometrics(password);
      }
    } catch (e) {
      console.log("failed to verify Biometrics", e);
      setErrorText(intl.formatMessage({ id: "common.text.wrongPassword" }));
      return;
    }

    Keyboard.dismiss();
    close();
  };

  return (
    <View style={style.flatten(["height-full", "justify-center"])}>
      <View
        style={style.flatten([
          "margin-x-page",
          "content-stretch",
          "items-stretch",
          "background-color-card-background",
          "border-color-card-border",
          "border-width-1",
          "border-radius-8",
        ])}
      >
        <Text
          style={style.flatten([
            "text-center",
            "text-medium-medium",
            "color-label-text-1",
            "margin-x-16",
            "margin-y-16",
          ])}
        >
          {intl.formatMessage({
            id:
              keychainStore.isBiometryType === BIOMETRY_TYPE.FACE ||
              keychainStore.isBiometryType === BIOMETRY_TYPE.FACE_ID
                ? "common.text.enableBiometrics.face"
                : (Platform.OS === "ios"
                ? "common.text.enableBiometrics.touch"
                : "common.text.enableBiometrics.fingerprint"),
          })}
        </Text>
        <NormalInput
          value={password}
          error={errorText}
          onChangeText={setPassword}
          secureTextEntry={true}
          showPassword={showPassword}
          onShowPasswordChanged={setShowPassword}
          style={{
            marginHorizontal: 16,
            paddingBottom: errorText.length !== 0 ? 24 : 0,
          }}
          autoFocus
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "stretch",
            alignItems: "center",
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 12,
          }}
        >
          <Button
            color="neutral"
            mode="outline"
            text={intl.formatMessage({ id: "common.text.cancel" })}
            onPress={() => {
              Keyboard.dismiss();
              close();
            }}
            containerStyle={style.flatten(["flex-1"])}
          />
          <Button
            text={intl.formatMessage({ id: "common.text.enable" })}
            onPress={enableBiometrics}
            disabled={password.length == 0}
            containerStyle={style.flatten(["flex-1", "margin-left-8"])}
          />
        </View>
      </View>
      <AvoidingKeyboardBottomView />
    </View>
  );
});
