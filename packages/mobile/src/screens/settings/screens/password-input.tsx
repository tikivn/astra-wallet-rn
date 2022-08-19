import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NormalInput } from "../../../components/input/normal-input";
import { Button } from "../../../components";
import { useSmartNavigation } from "../../../navigation-util";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";

export declare type PasswordInputScreenType =
  | "updatePassword"
  | "viewMnemonic"
  | "deleteWallet";

export const PasswordInputScreen: FunctionComponent = observer(() => {
  const MIN_LENGTH_PASSWORD = 8;

  const navigation = useNavigation();
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
    if (type !== "deleteWallet") {
      return null;
    }

    return (
      <Text
        style={style.flatten([
          "color-gray-30",
          "text-caption",
          "text-center",
          "padding-y-32",
          "margin-bottom-32",
        ])}
      >
        {intl.formatMessage({ id: "deleteAccount.top.title" })}
      </Text>
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

  useEffect(() => {
    updateNavigationTitle();
  });

  function updateNavigationTitle() {
    let textId;
    switch (type) {
      case "updatePassword":
        textId = "changePassword.title";
        break;
      case "viewMnemonic":
        textId = "viewPassphase.title";
        break;
      case "deleteWallet":
        textId = "deleteAccount.title";
        break;
    }

    navigation.setOptions({
      title: intl.formatMessage({ id: textId }),
    });
  }

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
      <View
        style={style.flatten(["absolute-fill", "background-color-background"])}
      ></View>
      <View style={style.flatten(["flex-1", "background-color-transparent"])}>
        <KeyboardAwareScrollView
          contentContainerStyle={style.flatten([
            "flex-grow-1",
            "padding-x-page",
          ])}
        >
          <View style={{ height: 32 }} />
          {getTopView()}
          <NormalInput
            value={password}
            label={getInputLabel()}
            error={error}
            secureTextEntry={true}
            showPassword={showPassword}
            onShowPasswordChanged={setShowPassword}
            onChangeText={setPassword}
            onBlur={validateInputData}
            style={{ marginBottom: 24, paddingBottom: 24 }}
          />

          <Button
            containerStyle={style.flatten(["border-radius-4", "height-44"])}
            textStyle={style.flatten(["subtitle2"])}
            text={getButtonText()}
            size="large"
            onPress={onProceed}
            disabled={!inputDataValid}
            color={type === "deleteWallet" ? "danger" : "primary"}
          />
          <View style={style.get("flex-5")} />
        </KeyboardAwareScrollView>
      </View>
    </React.Fragment>
  );
});
