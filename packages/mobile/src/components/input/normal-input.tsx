import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { KeyboardTypeOptions, Platform, TouchableOpacity, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { EyeCloseIcon, EyeOpenIcon } from "../icon";
import { TextInput } from "./input";

interface NormalInputProps {
  value?: string;
  placeholder?: string;
  label?: string;
  info?: string;
  error?: string;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  rightView?: React.ReactNode;
  onShowPasswordChanged?: (showPassword: boolean) => void;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  validations?: Array<Record<string, any>>;
  style?: ViewStyle;
}

export const NormalInput: FunctionComponent<NormalInputProps> = observer(({
  value,
  placeholder,
  label,
  info,
  error,
  secureTextEntry = false,
  showPassword = false,
  multiline,
  numberOfLines,
  keyboardType,
  rightView,
  onShowPasswordChanged,
  onChangeText,
  onFocus,
  onBlur,
  autoFocus,
  validations,
  style
}) => {
  const styleBuilder = useStyle();

  const [isFocused, setIsFocused] = useState(false);
  const [errorText, setErrorText] = useState(error);

  const labelStyle = {
    ...styleBuilder.flatten([
      "text-medium-medium",
      "color-input-label",
      "margin-bottom-4"
    ]),
  };

  const errorLabelStyle = {
    ...styleBuilder.flatten([
      "text-base-regular",
      (errorText && errorText.length != 0) ? "color-input-error" : "color-input-label",
    ]),
  };

  const inputContainerStyle = {
    ...styleBuilder.flatten([
      "background-color-input-background",
      "input-container",
    ]),
    ...borderColor(),
  };

  const containerStyle = {
    ...styleBuilder.flatten([
      "padding-bottom-0"
    ]),
  };

  const textInputStyle = {
    ...styleBuilder.flatten([
      "text-medium-regular",
      "color-input-value"
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
    var borderStyle = styleBuilder.get("border-color-input-inactive");

    if (isFocused) {
      borderStyle = styleBuilder.get("border-color-input-active");
    }

    if (errorText && errorText.length != 0) {
      borderStyle = styleBuilder.get("border-color-input-error");
    }

    return borderStyle;
  }

  function inputRightView(): React.ReactNode {
    return secureTextEntry
      ? <TouchableOpacity
        style={{ justifyContent: "center", height: 36 }}
        onPress={() => {
          if (onShowPasswordChanged) {
            onShowPasswordChanged(!showPassword);
          }
        }}>
        {showPassword ? <EyeCloseIcon /> : <EyeOpenIcon />}
      </TouchableOpacity>
      : <View style={{ height: 36 }}>{rightView}</View>;
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
      placeholder={placeholder}
      label={label}
      labelStyle={labelStyle}
      error={errorText || info}
      errorLabelStyle={errorLabelStyle}
      placeholderTextColor={styleBuilder.get("color-input-label").color}
      inputContainerStyle={inputContainerStyle}
      containerStyle={containerStyle}
      style={textInputStyle}
      secureTextEntry={secureTextEntry && !showPassword}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType}
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
      autoFocus={autoFocus}
    />
  </View>;
});