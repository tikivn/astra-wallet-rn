import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native";
import { useStyle } from "../../../styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NormalInput } from "../../../components/input/normal-input";
import { Button } from "../../../components";
import { useSmartNavigation } from "../../../navigation-util";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";

export const PasswordInputScreen: FunctionComponent = observer(() => {
  const MIN_LENGTH_PASSWORD = 8;

  const route = useRoute<RouteProp<Record<string, {
    nextScreen: string;
    forwardPassword: boolean;
  }>, string>>();

  const style = useStyle();
  const intl = useIntl();
  const { keyRingStore } = useStore();
  const smartNavigation = useSmartNavigation();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);

  const onCreate = async () => {
    const isCorrected = await keyRingStore.checkPassword(password);
    if (isCorrected) {
      smartNavigation.navigate(
        route.params.nextScreen,
        route.params.forwardPassword ? { currentPassword: password } : {}
      );
    }
    else {
      setError(intl.formatMessage({ id: "common.text.wrongPassword" }));
      setInputDataValid(false);
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
            label={intl.formatMessage({ id: "common.text.currentPassword" })}
            error={error}
            secureTextEntry={true}
            showPassword={showPassword}
            onShowPasswordChanged={setShowPassword}
            onChangeText={setPassword}
            onBlur={validateInputData}
            style={{ marginTop: 32, marginBottom: 24, paddingBottom: 24, }}
          />

          <Button
            containerStyle={style.flatten(["border-radius-4", "height-44"])}
            textStyle={style.flatten(["subtitle2"])}
            text={intl.formatMessage({ id: "common.text.continue" })}
            size="large"
            onPress={onCreate}
            disabled={!inputDataValid}
          />
          <View style={style.get("flex-5")} />
        </KeyboardAwareScrollView>
      </View>
    </React.Fragment>
  );
});
