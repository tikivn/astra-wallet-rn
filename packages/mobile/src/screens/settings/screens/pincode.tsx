import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";

import { useSmartNavigation } from "../../../navigation";

import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NormalInput } from "../../../components/input/normal-input";
import { useIntl } from "react-intl";

export const EnterPincodeScreen: FunctionComponent = observer(() => {
  const MIN_LENGTH_PASSWORD = 8;

  const style = useStyle();
  const intl = useIntl();

  const { keyRingStore } = useStore();
  const smartNavigation = useSmartNavigation();

  const [password, setPassword] = useState("");
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitPassword = async () => {
    setIsLoading(true);
    try {
      await onEnterPassword();
      setPasswordErrorText("");
    } catch (e) {
      console.log(e);
      setPasswordErrorText(intl.formatMessage({ id: "common.text.wrongPassword" }));
    } finally {
      setIsLoading(false);
    }
  };

  const onEnterPassword = async () => {
    const index = keyRingStore.multiKeyStoreInfo.findIndex(
      (keyStore) => keyStore.selected
    );

    if (index >= 0) {
      const privateData = await keyRingStore.showKeyRing(index, password);
      smartNavigation.replaceSmart("Setting.ViewPrivateData", {
        privateData,
        privateDataType: keyRingStore.keyRingType,
      });
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
            label={intl.formatMessage({ id: "common.text.securePassword" })}
            error={passwordErrorText}
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
            text="Xem"
            size="large"
            loading={isLoading}
            onPress={submitPassword}
            disabled={!inputDataValid}
          />
          <View style={style.get("flex-5")} />
        </KeyboardAwareScrollView>
      </View>
    </React.Fragment>
  );
});

