import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { NormalInput } from "../../../components/input/normal-input";
import { AlertInline, Button } from "../../../components";
import { useSmartNavigation } from "../../../navigation-util";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { MIN_PASSWORD_LENGTH } from "../../../common/utils";

export declare type PasswordInputScreenType =
  | "updatePassword"
  | "viewMnemonic"
  | "deleteWallet";

export const PasswordInputScreen: FunctionComponent = observer(() => {
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
  const {
    keyRingStore,
    keychainStore,
    userLoginStore,
    analyticsStore,
  } = useStore();
  const smartNavigation = useSmartNavigation();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getInputLabel = () => {
    let title;
    switch (type) {
      case "updatePassword":
        title = intl.formatMessage({ id: "common.text.currentPassword" });
        break;
      case "viewMnemonic":
        title = intl.formatMessage({ id: "common.text.securePassword" });
        break;
      default:
        break;
    }

    return title;
  };

  const getInputPlaceholder = () => {
    let title;
    if (type === "deleteWallet") {
      title = intl.formatMessage({ id: "common.text.password" });
    }

    return title;
  };

  const getButtonText = () => {
    let title;
    switch (type) {
      case "updatePassword":
        title = "common.text.continue";
        break;
      case "viewMnemonic":
        title = "common.text.view";
        break;
      case "deleteWallet":
        title = "deleteAccount.button.delete";
        break;
    }

    return intl.formatMessage({ id: title });
  };

  const getTopView = () => {
    if (type !== "deleteWallet") {
      return null;
    }

    return (
      <View style={style.flatten(["margin-bottom-24"])}>
        <Text
          style={style.flatten([
            "color-gray-10",
            "text-x-large-semi-bold",
            "text-center",
            "margin-bottom-12",
          ])}
        >
          {intl.formatMessage({ id: "deleteAccount.title" })}
        </Text>
        <AlertInline
          type="warning"
          content={intl.formatMessage({ id: "deleteAccount.top.title" })}
        />
      </View>
    );
  };

  const onProceed = async () => {
    setIsLoading(true);
    const index = keyRingStore.multiKeyStoreInfo.findIndex(
      (keyStore: any) => keyStore.selected
    );

    if (index === -1) {
      setIsLoading(false);
      return;
    }

    const isValidPassword = await checkPassword();

    if (!isValidPassword) {
      analyticsStore.logEvent("astra_hub_input_password", {
        screen: type,
        success: false,
        error: intl.formatMessage({ id: "common.text.wrongPassword" }),
      });
      showError();
      setIsLoading(false);
      return;
    }

    analyticsStore.logEvent("astra_hub_input_password", {
      screen: type,
      success: true,
    });

    switch (type) {
      case "updatePassword":
        setIsLoading(false);
        smartNavigation.navigate("Settings.NewPasswordInput", {
          currentPassword: password,
        });
        break;
      case "viewMnemonic":
        const privateData = await keyRingStore.showKeyRing(index, password);
        setIsLoading(false);
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

          analyticsStore.setUserProperties({
            astra_hub_from_address: null,
          });

          setIsLoading(false);
          smartNavigation.reset({
            index: 0,
            routes: [
              {
                name: "Unlock",
              },
            ],
          });
        } else {
          setIsLoading(false);
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
    let title = "";
    switch (type) {
      case "updatePassword":
        title = intl.formatMessage({ id: "changePassword.title" });
        break;
      case "viewMnemonic":
        title = intl.formatMessage({ id: "viewPassphase.title" });
        break;
      default:
        break;
    }

    navigation.setOptions({
      title,
    });
  }

  function validateInputData() {
    if (password.length >= MIN_PASSWORD_LENGTH) {
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
      />
      <View
        style={style.flatten([
          "flex-1",
          "padding-x-page",
          "background-color-transparent",
        ])}
      >
        <View style={{ height: 24 }} />
        {getTopView()}
        <NormalInput
          value={password}
          placeholder={getInputPlaceholder()}
          label={getInputLabel()}
          error={error}
          secureTextEntry={true}
          showPassword={showPassword}
          onShowPasswordChanged={setShowPassword}
          onChangeText={setPassword}
          onBlur={validateInputData}
          autoFocus
        />
      </View>
      <View
        style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}
      >
        <View
          style={style.flatten([
            "height-1",
            "background-color-gray-70",
            "margin-bottom-12",
          ])}
        />
        <Button
          containerStyle={style.flatten(["margin-x-page"])}
          text={getButtonText()}
          onPress={onProceed}
          disabled={!inputDataValid}
          loading={isLoading}
          color={type === "deleteWallet" ? "negative" : "primary"}
        />
        <AvoidingKeyboardBottomView />
      </View>
    </React.Fragment>
  );
});
