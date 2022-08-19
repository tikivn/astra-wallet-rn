import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { NormalInput } from "../../../components/input/normal-input";
import { AlertInline, Button } from "../../../components";
import { useSmartNavigation } from "../../../navigation-util";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";

export declare type PasswordInputScreenType =
  | "updatePassword"
  | "viewMnemonic"
  | "deleteWallet";

export const PasswordInputScreen: FunctionComponent = observer(() => {
  const MIN_LENGTH_PASSWORD = 8;

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          type: PasswordInputScreenType;
        }
      >,
      string
    >
  >();
  const { type } = route.params;

  const style = useStyle();
  const intl = useIntl();
  const { keyRingStore, keychainStore, userLoginStore } = useStore();
  const smartNavigation = useSmartNavigation();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);

  const getInputLabel = () => {
    let textId;
    switch (type) {
      case "updatePassword":
        textId = "common.text.currentPassword";
        break;
      case "viewMnemonic":
        textId = "common.text.securePassword";
        break;
      case "deleteWallet":
        textId = "common.text.password";
        break;
    }

    return intl.formatMessage({ id: textId });
  };

  const getButtonText = () => {
    let textId;
    switch (type) {
      case "updatePassword":
        textId = "common.text.continue";
        break;
      case "viewMnemonic":
        textId = "common.text.view";
        break;
      case "deleteWallet":
        textId = "deleteAccount.button.delete";
        break;
    }

    return intl.formatMessage({ id: textId });
  };

  const getTopView = () => {
    var title = "";
    switch (type) {
      case "updatePassword":
        title = intl.formatMessage({ id: "changePassword.title" });
        break;
      case "viewMnemonic":
        title = intl.formatMessage({ id: "viewPassphase.title" });
        break;
      case "deleteWallet":
        title = intl.formatMessage({ id: "deleteAccount.title" });
        break;
      default:
        break;
    }

    return (
      <View style={style.flatten([
        "margin-y-24",
      ])}>
        <Text style={style.flatten([
          "color-gray-10",
          "text-x-large-semi-bold",
          "text-center",
          "margin-bottom-12",
        ])}>
          {title}
        </Text>
        {type === "deleteWallet" && (
          <AlertInline
            type="warning"
            content={intl.formatMessage({ id: "deleteAccount.top.title" })}
          />
        )}
      </View>
    );
  };

  const onProceed = async () => {
    const index = keyRingStore.multiKeyStoreInfo.findIndex(
      (keyStore: any) => keyStore.selected
    );

    if (index === -1) {
      return;
    }

    const isValidPassword = await checkPassword();

    if (!isValidPassword) {
      showError();
      return;
    }

    switch (type) {
      case "updatePassword":
        smartNavigation.navigate("Settings.NewPasswordInput", {
          currentPassword: password,
        });
        break;
      case "viewMnemonic":
        const privateData = await keyRingStore.showKeyRing(index, password);
        smartNavigation.replaceSmart("Setting.ViewPrivateData", {
          privateData,
          privateDataType: keyRingStore.keyRingType,
        });
        break;
      case "deleteWallet":
        await keyRingStore.deleteKeyRing(index, password);

        if (keyRingStore.multiKeyStoreInfo.length === 0) {
          await keychainStore.reset();

          // Social Login
          if (userLoginStore.isSocialLoginActive) {
            await userLoginStore.clearLoginData();
          }

          smartNavigation.reset({
            index: 0,
            routes: [
              {
                name: "Unlock",
              },
            ],
          });
        }
        break;
    }
  };

  useEffect(() => {
    validateInputData();
  }, [password]);

  function validateInputData() {
    if (password.length >= MIN_LENGTH_PASSWORD) {
      setInputDataValid(true);
      return;
    }

    setInputDataValid(false);
  }

  async function checkPassword() {
    if (userLoginStore.isSocialLoginActive) {
      return await checkAndUpdateSocialLoginPassword();
    }

    let isValidPassword;
    try {
      await keyRingStore.unlock(password);
      isValidPassword = await keyRingStore.checkPassword(password);
    } catch (e) {
      isValidPassword = false;
    }

    return isValidPassword;
  }

  async function checkAndUpdateSocialLoginPassword() {
    try {
      const localPassword = await userLoginStore.getPassword();
      await userLoginStore.reconstructSocialLoginData({ password });

      // update password
      if (localPassword !== password) {
        const index = keyRingStore.multiKeyStoreInfo.findIndex(
          (keyStore: any) => {
            return keyStore.selected;
          }
        );

        await keyRingStore.unlock(localPassword);
        await keyRingStore.updatePasswordKeyRing(
          index,
          localPassword,
          password
        );
        await keyRingStore.unlock(password);

        if (keychainStore.isBiometryOn && keychainStore.isBiometrySupported) {
          await keychainStore.turnOnBiometry(password);
        }
      }
    } catch (e) {
      return false;
    }

    return true;
  }

  function showError() {
    setError(intl.formatMessage({ id: "common.text.wrongPassword" }));
    setInputDataValid(false);
  }

  return (
    <React.Fragment>
      <View style={style.flatten(["absolute-fill", "background-color-background"])} />
      <View style={style.flatten(["flex-1", "padding-x-page", "background-color-transparent"])}>
        {getTopView()}
        <NormalInput
          value={password}
          placeholder={getInputLabel()}
          // label={getInputLabel()}
          error={error}
          secureTextEntry={true}
          showPassword={showPassword}
          onShowPasswordChanged={setShowPassword}
          onChangeText={setPassword}
          onBlur={validateInputData}
          style={{ marginBottom: 24, paddingBottom: 24 }}
        />
        <View style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}>
          <Button
            containerStyle={style.flatten(["border-radius-4", "height-44"])}
            textStyle={style.flatten(["subtitle2"])}
            text={getButtonText()}
            size="large"
            onPress={onProceed}
            disabled={!inputDataValid}
            color={type === "deleteWallet" ? "danger" : "primary"}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </React.Fragment>
  );
});
