import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native";
import { useStyle } from "../../../styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NormalInput } from "../../../components/input/normal-input";
import { Button } from "../../../components";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";

export const NewPasswordInputScreen: FunctionComponent = observer(() => {
  const MIN_LENGTH_PASSWORD = 8;

  const route = useRoute<RouteProp<Record<string, {
    currentPassword: string;
  }>, string>>();

  const style = useStyle();
  const intl = useIntl();
  const { keyRingStore, keychainStore, socialLoginStore } = useStore();
  const navigation = useNavigation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const onCreate = async () => {
    setIsCreating(true);

    const currentPassword = route.params.currentPassword;

    if (socialLoginStore.isActive) {
      try {
        await socialLoginStore.updatePassword(password);
      }
      catch (e) {
        console.log(e);
        setIsCreating(false);
        return
      }
    }
    
    const success = await keyRingStore.updatePassword(currentPassword, password);
    if (success) {
      await keyRingStore.unlock(password);
      if (keychainStore.isBiometryOn && keychainStore.isBiometrySupported) {
        await keychainStore.turnOnBiometry(password);
      }

      setIsCreating(false);

      navigation.navigate("Setting", {
        screen: "Setting",
        params: {
          floatAlert: {
            type: "success",
            content: intl.formatMessage({ id: "common.text.changePasswordSuccess" }),
          }
        }
      });
      return;
    }

    setIsCreating(false);
  };

  useEffect(() => {
    validateInputData();
  }, [password, confirmPassword]);

  function validateInputData() {
    if (password.length >= MIN_LENGTH_PASSWORD
      && password === confirmPassword) {
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
          <NormalInput
            value={password}
            label={intl.formatMessage({ id: "common.text.newPassword" })}
            info={intl.formatMessage({
              id: "common.text.minimumCharacters"
            }).replace("{number}", `${MIN_LENGTH_PASSWORD}`)}
            secureTextEntry={true}
            showPassword={showPassword}
            onShowPasswordChanged={setShowPassword}
            onChangeText={setPassword}
            onBlur={validateInputData}
            validations={[{
              minLength: MIN_LENGTH_PASSWORD,
              error: intl.formatMessage({
                id: "common.text.minimumCharacters"
              }).replace("{number}", `${MIN_LENGTH_PASSWORD}`)
            }]}
            style={{ marginTop: 32, marginBottom: 24, paddingBottom: 24, }}
          />

          <NormalInput
            value={confirmPassword}
            label={intl.formatMessage({ id: "common.text.inputVerifyNewPassword" })}
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
            text={intl.formatMessage({ id: "common.text.changePassword" })}
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
