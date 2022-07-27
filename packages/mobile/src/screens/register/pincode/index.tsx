import React, { FunctionComponent, useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
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

// Social Login
enum SocialLoginUserState {
  new, existed, unknown
}

export const NewPincodeScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          mnemonic?: string;
          bip44HDPath: BIP44HDPath;
        }
      >,
      string
    >
  >();

  const MIN_LENGTH_PASSWORD = 8;

  const { keychainStore, socialLoginStore } = useStore();
  const style = useStyle();
  const intl = useIntl();

  const toastModal = useToastModal();

  const smartNavigation = useSmartNavigation();

  const { registerConfig, mnemonic, bip44HDPath } = route.params;

  const [name, setName] = useState(socialLoginStore.userData?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);
  const [isBiometricOn, setIsBiometricOn] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState("");

  // Social Login
  const [checkingSocialLogin, setCheckingSocialLogin] = useState(false);
  const [isNewSocialLoginUser, setIsNewSocialLoginUser] = useState(SocialLoginUserState.unknown);

  const onCreate = async () => {
    setIsCreating(true);

    var registerMnemonic = mnemonic;
    var registerPassword = confirmPassword;

    // Social Login
    if (socialLoginStore.userData && !socialLoginStore.isActive) {
      try {
        await socialLoginStore.reconstruct({
          password: confirmPassword,
        });

        registerMnemonic = await socialLoginStore.getSeedPhrase();
        registerPassword = await socialLoginStore.getPassword();
      }
      catch (e) {
        console.log(e);
        setIsCreating(false);
        return;
      }
    }
    else if (!registerMnemonic) {
      setIsCreating(false);
      return;
    }

    await registerConfig.createMnemonic(
      name,
      registerMnemonic,
      registerPassword,
      bip44HDPath
    )

    if (keychainStore.isBiometrySupported && isBiometricOn) {
      await keychainStore.turnOnBiometry(confirmPassword);
    }

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
  };

  useEffect(() => {
    validateInputData();
  }, [name, password, confirmPassword]);

  useEffect(() => {
    // Social Login
    if ((socialLoginStore.userData && !socialLoginStore.isActive)
      && !checkingSocialLogin) {
      checkSocialLogin();
    }
  }, [checkingSocialLogin]);

  useEffect(() => {
    // Social Login
    if ((socialLoginStore.userData && !socialLoginStore.isActive)
      && isNewSocialLoginUser != SocialLoginUserState.unknown) {
      toastModal.makeToast({
        title: intl.formatMessage({
          id: isNewSocialLoginUser == SocialLoginUserState.new ? "register.alert.socialLogin.newAccount" : "register.alert.socialLogin.existedAccount"
        }).replace("{provider}", socialLoginStore.selectedServiceProviderType?.toString() || ""),
        type: isNewSocialLoginUser == SocialLoginUserState.new ? "success" : "infor",
      });
    }
  }, [isNewSocialLoginUser]);

  function validateInputData() {
    if (password.length >= MIN_LENGTH_PASSWORD
      && password === confirmPassword
      && name.length != 0) {
      setConfirmPasswordErrorText("");
      setInputDataValid(true);
      return;
    }
    else if (0 < confirmPassword.length) {
      setConfirmPasswordErrorText(
        intl.formatMessage({ id: "common.text.passwordNotMatching" })
      );
    }

    setInputDataValid(false);
  }

  function checkSocialLogin() {
    // Social Login
    if (socialLoginStore.userData && !socialLoginStore.isActive) {
      setCheckingSocialLogin(true);

      socialLoginStore.checkSocialLogin().then((info) => {
        setName(info.userData.email);
        setIsNewSocialLoginUser(
          info.isNewUser ? SocialLoginUserState.new : SocialLoginUserState.existed
        );
      }).catch((e) => {
        console.log("__info__error", e);
      });
    }
  }

  return (
    <React.Fragment>
      <View
        style={style.flatten([
          "absolute-fill",
          "background-color-background",
        ])}>
      </View>
      <View
        style={style.flatten(["flex-1", "background-color-transparent"])}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={style.flatten(["flex-grow-1", "padding-x-page"])}
        >
          <View style={style.flatten(["margin-y-32", "items-center"])}>
            <Image style={style.flatten(["height-16"])} source={require('../../../assets/image/step-3.png')} resizeMode='contain' />
          </View>

          {(!socialLoginStore.userData && !socialLoginStore.isActive) && (
            <NormalInput
              value={name}
              label={intl.formatMessage({ id: "common.text.accountHolder" })}
              onChangeText={setName}
              style={{ marginBottom: 24, }}
            />
          )}

          <NormalInput
            value={password}
            label={intl.formatMessage({ id: "common.text.password" })}
            info={intl.formatMessage({
              id: "common.text.minimumCharacters"
            }).replace("{number}", `${MIN_LENGTH_PASSWORD}`)}
            secureTextEntry={true}
            showPassword={showPassword}
            onShowPasswordChanged={setShowPassword}
            onChangeText={setPassword}
            onBlur={validateInputData}
            style={{ marginBottom: 24, paddingBottom: 24, }}
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
            validations={[{
              validateFunc: (value: string) => {
                return value.length == 0 || value === password;
              },
              error: intl.formatMessage({ id: "common.text.passwordNotMatching" })
            }]}
            style={{ marginBottom: 24, paddingBottom: 24, }}
          />

          {keychainStore.isBiometrySupported && (
            <View style={{ flexDirection: "row", alignContent: "stretch", alignItems: "center", marginBottom: 16, }}>
              <BiometricsIcon />
              <Text style={style.flatten(["text-base-medium", "color-gray-10", "flex-1", "margin-left-8"])}>{intl.formatMessage({ id: "settings.unlockBiometrics" })}</Text>
              <Toggle
                on={isBiometricOn}
                onChange={(value) => setIsBiometricOn(value)}
              />
            </View>
          )}
          <Button
            containerStyle={style.flatten(["border-radius-4", "height-44"])}
            textStyle={style.flatten(["subtitle2"])}
            text={intl.formatMessage({ id: "register.button.createAccount" })}
            size="large"
            loading={isCreating}
            onPress={onCreate}
            disabled={!inputDataValid}
          />
          <View style={style.get("flex-5")} />
        </KeyboardAwareScrollView>
      </View>
    </React.Fragment>
  );
});
