import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../../navigation-util";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { BIP44HDPath } from "@keplr-wallet/background";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NormalInput } from "../../../components/input/normal-input";
import { useIntl } from "react-intl";
import { BiometricsIcon } from "../../../components";
import { Toggle } from "../../../components/toggle";
import { useStore } from "../../../stores";
import { useToastModal } from "../../../providers/toast-modal";
import { BIOMETRY_TYPE } from "react-native-keychain";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { SocialLoginUserState } from "../../../stores/user-login";
import { MIN_PASSWORD_LENGTH } from "../../../common/utils";

export const NewPincodeScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerType?: "new" | "recover" | undefined;
          registerConfig: RegisterConfig;
          mnemonic?: string;
          bip44HDPath: BIP44HDPath;
        }
      >,
      string
    >
  >();

  const {
    keychainStore,
    userLoginStore,
    keyRingStore,
    analyticsStore,
  } = useStore();
  const style = useStyle();
  const intl = useIntl();

  const toastModal = useToastModal();

  const smartNavigation = useSmartNavigation();

  const { registerConfig, mnemonic, bip44HDPath } = route.params;

  const [name, setName] = useState(userLoginStore.socialLoginData?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);
  const [isBiometricOn, setIsBiometricOn] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState("");

  // Social Login
  const [checkingSocialLogin, setCheckingSocialLogin] = useState(false);
  const [isNewSocialLoginUser, setIsNewSocialLoginUser] = useState(
    SocialLoginUserState.unknown
  );

  const onCreate = async () => {
    setIsCreating(true);

    let registerMnemonic = mnemonic;
    let registerPassword = confirmPassword;

    // Social Login
    if (userLoginStore.socialLoginData && !userLoginStore.isSocialLoginActive) {
      try {
        await userLoginStore.reconstructSocialLoginData({
          password: confirmPassword,
        });

        registerMnemonic = await userLoginStore.getSeedPhrase();
        registerPassword = await userLoginStore.getPassword();
      } catch (e) {
        console.log(e);
        setPasswordErrorText(
          intl.formatMessage({ id: "common.text.wrongPassword" })
        );
        setIsCreating(false);
        return;
      }
    } else if (!registerMnemonic) {
      setIsCreating(false);
      return;
    }

    await registerConfig.createMnemonic(
      name,
      registerMnemonic,
      registerPassword,
      bip44HDPath
    );

    if (keychainStore.isBiometrySupported && isBiometricOn) {
      await keychainStore.turnOnBiometry(confirmPassword);
    }

    try {
      // Definetly, the last key is newest keyring.
      if (keyRingStore.multiKeyStoreInfo.length > 0) {
        await keyRingStore.changeKeyRing(
          keyRingStore.multiKeyStoreInfo.length - 1
        );
      }
    } catch (e: any) {
      console.log(e);
    }

    const eventName =
      route.params.registerType !== "recover"
        ? "astra_hub_create_account"
        : "astra_hub_recover_account";

    analyticsStore.logEvent(eventName, {
      type: "mnemonic",
      use_biometrics: keychainStore.isBiometrySupported && isBiometricOn,
    });

    smartNavigation.reset({
      index: 0,
      routes: [
        {
          name: "Register.End",
          params: {
            registerType: route.params.registerType,
          },
        },
      ],
    });
  };

  useEffect(() => {
    updateNavigationTitle();
  });

  useEffect(() => {
    setPasswordErrorText("");
    validateInputData();
  }, [name, password, confirmPassword]);

  useEffect(() => {
    // Social Login
    if (
      userLoginStore.socialLoginData &&
      !userLoginStore.isSocialLoginActive &&
      !checkingSocialLogin
    ) {
      checkSocialLogin();
    }
  }, [checkingSocialLogin]);

  useEffect(() => {
    // Social Login
    if (
      userLoginStore.socialLoginData &&
      !userLoginStore.isSocialLoginActive &&
      isNewSocialLoginUser != SocialLoginUserState.unknown
    ) {
      toastModal.makeToast({
        title: intl.formatMessage(
          {
            id:
              isNewSocialLoginUser == SocialLoginUserState.new
                ? "register.alert.socialLogin.newAccount"
                : "register.alert.socialLogin.existedAccount",
          },
          {
            provider:
              userLoginStore.selectedServiceProviderType?.toString() || "",
          }
        ),
        type:
          isNewSocialLoginUser == SocialLoginUserState.new
            ? "success"
            : "infor",
      });
    }
  }, [isNewSocialLoginUser]);

  function updateNavigationTitle() {
    let textId;

    if (isNewSocialLoginUser === SocialLoginUserState.recover) {
      textId = "register.recoverMnemonic.title";
    } else {
      textId = "register.setPincode.title";
    }

    smartNavigation.setOptions({
      title: intl.formatMessage({ id: textId }),
    });
  }

  function validateInputData() {
    if (
      password.length >= MIN_PASSWORD_LENGTH &&
      password === confirmPassword &&
      name.length != 0
    ) {
      setConfirmPasswordErrorText("");
      setInputDataValid(true);
      return;
    } else if (0 < confirmPassword.length) {
      setConfirmPasswordErrorText(
        intl.formatMessage({ id: "common.text.passwordNotMatching" })
      );
    }

    setInputDataValid(false);
  }

  function checkSocialLogin() {
    // Social Login
    if (userLoginStore.socialLoginData && !userLoginStore.isSocialLoginActive) {
      setCheckingSocialLogin(true);

      userLoginStore
        .checkSocialLogin()
        .then((info) => {
          setName(info.socialLoginData.email);
          setIsNewSocialLoginUser(
            info.isNewUser
              ? SocialLoginUserState.new
              : SocialLoginUserState.recover
          );
        })
        .catch((e) => {
          console.log("__info__error", e);
        });
    }
  }

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten([
          "flex-grow-1",
          "padding-x-page",
          "padding-top-24",
        ])}
        enableOnAndroid
      >
        {!userLoginStore.socialLoginData &&
          !userLoginStore.isSocialLoginActive && (
            <NormalInput
              autoFocus
              value={name}
              label={intl.formatMessage({ id: "common.text.accountHolder" })}
              onChangeText={setName}
              style={{ marginBottom: 24 }}
            />
          )}

        <NormalInput
          value={password}
          label={intl.formatMessage({ id: "common.text.password" })}
          error={passwordErrorText}
          info={intl.formatMessage(
            {
              id: "common.text.minimumCharacters",
            },
            {
              number: `${MIN_PASSWORD_LENGTH}`,
            }
          )}
          secureTextEntry={true}
          showPassword={showPassword}
          onShowPasswordChanged={setShowPassword}
          onChangeText={setPassword}
          onBlur={validateInputData}
          style={{ marginBottom: 24, paddingBottom: 24 }}
        />

        <NormalInput
          value={confirmPassword}
          label={intl.formatMessage({ id: "common.text.inputVerifyPassword" })}
          error={confirmPasswordErrorText}
          secureTextEntry={true}
          showPassword={showPassword}
          onShowPasswordChanged={setShowPassword}
          onChangeText={setConfirmPassword}
          onBlur={validateInputData}
          validations={[
            {
              validateFunc: (value: string) => {
                return value.length == 0 || value === password;
              },
              error: intl.formatMessage({
                id: "common.text.passwordNotMatching",
              }),
            },
          ]}
          style={{
            marginBottom: confirmPasswordErrorText.length !== 0 ? 12 : 0,
            paddingBottom: 24,
          }}
        />

        {!keychainStore.isBiometrySupported && (
          <View
            style={{
              flexDirection: "row",
              alignContent: "stretch",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <BiometricsIcon
              color={style.get("color-gray-10").color}
              size={32}
              type={
                keychainStore.isBiometryType === BIOMETRY_TYPE.FACE ||
                keychainStore.isBiometryType === BIOMETRY_TYPE.FACE_ID
                  ? "face"
                  : "touch"
              }
            />
            <Text
              style={style.flatten([
                "text-base-medium",
                "color-gray-10",
                "flex-1",
                "margin-left-8",
              ])}
            >
              {intl.formatMessage({
                id:
                  keychainStore.isBiometryType === BIOMETRY_TYPE.FACE ||
                  keychainStore.isBiometryType === BIOMETRY_TYPE.FACE_ID
                    ? "settings.unlockBiometrics.face"
                    : "settings.unlockBiometrics.touch",
              })}
            </Text>
            <Toggle
              on={isBiometricOn}
              onChange={(value) => setIsBiometricOn(value)}
            />
          </View>
        )}
      </KeyboardAwareScrollView>
      <View style={style.flatten(["flex-1", "justify-end", "margin-bottom-0"])}>
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
        <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: 68,
          }}
        >
          <Button
            text={intl.formatMessage({ id: "register.button.createAccount" })}
            loading={isCreating}
            onPress={onCreate}
            disabled={!inputDataValid}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});
