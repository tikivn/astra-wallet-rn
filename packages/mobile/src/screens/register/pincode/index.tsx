import React, { FunctionComponent, useEffect, useState } from "react";
import { Image, View } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../../navigation-util";
import { NewMnemonicConfig } from "../mnemonic";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { BIP44HDPath } from "@keplr-wallet/background";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NormalInput } from "../../../components/input/normal-input";
import { useIntl } from "react-intl";

export const NewPincodeScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          registerConfig: RegisterConfig;
          newMnemonicConfig: NewMnemonicConfig;
          bip44HDPath: BIP44HDPath;
          type: "new" | "restore";
        }
      >,
      string
    >
  >();

  const MIN_LENGTH_PASSWORD = 8;

  const style = useStyle();
  const intl = useIntl();

  const smartNavigation = useSmartNavigation();

  const registerConfig = route.params.registerConfig;
  const newMnemonicConfig = route.params.newMnemonicConfig;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState("");

  const onCreate = async () => {
    setIsCreating(true);

    await registerConfig.createMnemonic(
      name,
      newMnemonicConfig.mnemonic,
      password,
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
  };

  useEffect(() => {
    validateInputData();
  }, [name, password, confirmPassword]);

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
            {(route.params.type === 'new') ?
              <Image style={style.flatten(["height-16"])} source={require('../../../assets/image/step-3.png')} resizeMode='contain' /> : null}
          </View>

          <NormalInput
            value={name}
            label={intl.formatMessage({ id: "common.text.accountHolder" })}
            onChangeText={setName}
            style={{ marginBottom: 24, }}
          />

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
