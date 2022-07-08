import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Platform, TouchableOpacity, View, ViewStyle } from "react-native";
import { Colors, useStyle } from "../../styles";
import { EyeCloseIcon, EyeOpenIcon } from "../icon";
import { TextInput } from "./input";

interface NormalInputProps {
  value?: string;
  label?: string;
  info?: string;
  error?: string;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  onShowPasswordChanged?: (showPassword: boolean) => void;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  validations?: Array<Record<string, any>>;
  style?: ViewStyle;
}

export const NormalInput: FunctionComponent<NormalInputProps> = observer(({
  value,
  label,
  info,
  error,
  secureTextEntry = false,
  showPassword = false,
  onShowPasswordChanged,
  onChangeText,
  onFocus,
  onBlur,
  validations,
  style
}) => {
  const styleBuilder = useStyle();

  const [isFocused, setIsFocused] = useState(false);
  const [errorText, setErrorText] = useState(error);

  const labelStyle = {
    ...styleBuilder.flatten([
      "text-medium-medium",
      "color-gray-30",
      "margin-bottom-4"
    ]),
  };

  const errorLabelStyle = {
    ...styleBuilder.flatten([
      "text-base-regular",
      (errorText && errorText.length != 0) ? "color-red-50" : "color-gray-30",
    ]),
  };

  const inputContainerStyle = {
    ...styleBuilder.flatten([
      "background-color-gray-90",
    ]),
    ...borderColor(),
  };

  const textInputStyle = {
    ...styleBuilder.flatten([
      "text-medium-regular",
      "color-gray-10"
    ]),
    ...Platform.select({
      android: {
        height: 19,
      }
    }),
    lineHeight: 19,
  };

  useEffect(() => {
    setErrorText(error);
  }, [error]);

  function borderColor() {
    var borderStyle = { borderColor: Colors["gray-60"] };

    if (isFocused) {
      borderStyle = { borderColor: Colors["blue-70"] };
    }

    if (errorText && errorText.length != 0) {
      borderStyle = { borderColor: Colors["red-50"] };
    }

    return borderStyle;
  }

  // const [showPassword, setShowPassword] = useState(showPassword);

  function inputRightView(): React.ReactNode {
    return secureTextEntry
      ? <TouchableOpacity onPress={() => {
        if (onShowPasswordChanged) {
          onShowPasswordChanged(!showPassword);
        }
        // setShowPassword(!showPassword);
      }}>
        {showPassword ? <EyeCloseIcon /> : <EyeOpenIcon />}
      </TouchableOpacity>
      : null;
  }

  function checkValidations() {
    if (!validations || validations.length == 0) {
      return;
    }

    var errorText = "";

    for (let index = 0; errorText.length == 0 && index < validations.length; index++) {
      const validation = validations[index];
      if (value && 0 < value.length && value.length < validation.minLength) {
        errorText = validation.error;
      }
      else if (validation.validateFunc && !validation.validateFunc(value)) {
        errorText = validation.error;
      }
    }

    setErrorText(errorText);
  }

  return <View style={style}>
    <TextInput
      value={value}
      label={label}
      labelStyle={labelStyle}
      error={errorText || info}
      errorLabelStyle={errorLabelStyle}
      inputContainerStyle={inputContainerStyle}
      style={textInputStyle}
      secureTextEntry={secureTextEntry && !showPassword}
      inputRight={inputRightView()}
      onChangeText={onChangeText}
      onFocus={() => {
        setIsFocused(true);
        if (onFocus) {
          onFocus();
        }
      }}
      onBlur={() => {
        setIsFocused(false);
        checkValidations();
        if (onBlur) {
          onBlur();
        }
      }}
    />
  </View>;
});