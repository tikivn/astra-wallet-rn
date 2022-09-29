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
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { MIN_PASSWORD_LENGTH } from "../../../common/utils";

export const NewPasswordInputScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          currentPassword: string;
        }
      >,
      string
    >
  >();

  const style = useStyle();
  const intl = useIntl();
  const { keyRingStore, keychainStore, userLoginStore } = useStore();
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

    if (userLoginStore.isSocialLoginActive) {
      try {
        await userLoginStore.updatePassword(password);
      } catch (e) {
        console.log(e);
        setIsCreating(false);
        return;
      }
    }

    const index = keyRingStore.multiKeyStoreInfo.findIndex((keyStore: any) => {
      return keyStore.selected;
    });

    // Must unlock with current password before update password
    await keyRingStore.unlock(currentPassword);
    await keyRingStore.updatePasswordKeyRing(index, currentPassword, password);
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
          content: intl.formatMessage({
            id: "common.text.changePasswordSuccess",
          }),
        },
      },
    });
  };

  useEffect(() => {
    validateInputData();
  }, [password, confirmPassword]);

  function validateInputData() {
    if (
      password.length >= MIN_PASSWORD_LENGTH &&
      password === confirmPassword
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

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten(["padding-x-page"])}
        enableOnAndroid
      >
        <NormalInput
          value={password}
          label={intl.formatMessage({ id: "common.text.newPassword" })}
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
          autoFocus
          validations={[
            {
              minLength: MIN_PASSWORD_LENGTH,
              error: intl.formatMessage(
                {
                  id: "common.text.minimumCharacters",
                },
                {
                  number: `${MIN_PASSWORD_LENGTH}`,
                }
              ),
            },
          ]}
          style={{ marginTop: 32, marginBottom: 24, paddingBottom: 24 }}
        />

        <NormalInput
          value={confirmPassword}
          label={intl.formatMessage({
            id: "common.text.inputVerifyNewPassword",
          })}
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
          style={{ marginBottom: 24, paddingBottom: 24 }}
        />
      </KeyboardAwareScrollView>
      <View
        style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}
      >
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
        <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: 56,
          }}
        >
          <Button
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
            text={intl.formatMessage({ id: "common.text.changePassword" })}
            loading={isCreating}
            onPress={onCreate}
            disabled={!inputDataValid}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});
