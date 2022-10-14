import React, { FunctionComponent, ReactElement, useState } from "react";
import { useStyle } from "../../styles";
import { Text, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "../spinner";
import { RectButton } from "../rect-button";

export const Button: FunctionComponent<{
  color?: "primary" | "neutral" | "negative";
  mode?: "solid" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  text: string;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  loading?: boolean;
  disabled?: boolean;

  onPress?: () => void;

  containerStyle?: ViewStyle;
  style?: ViewStyle;
  textStyle?: TextStyle;
}> = ({
  color = "primary",
  mode = "solid",
  size = "large",
  text,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  onPress,
  containerStyle,
  style: buttonStyle,
  textStyle,
}) => {
  const style = useStyle();

  const [isPressed, setIsPressed] = useState(false);

  const styleDefinition = (() => {
    var state = "default";
    if (disabled) {
      state = "disabled";
    } else if (loading || isPressed) {
      state = "highlighted";
    }

    return `button-${color}-${mode}-${state}`;
  })();

  const textDefinition = (() => {
    switch (size) {
      case "medium":
        return "text-base-medium";
      case "small":
        return "text-small-medium";
      default:
        return "text-medium-medium";
    }
  })();

  const loadingSpinner = (() => {
    return (
      <LoadingSpinner
        color={style.get(styleDefinition as any).color}
        size={24}
      />
    );
  })();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          styleDefinition as any,
          `button-${size}-container` as any,
          "overflow-hidden",
        ]),
        containerStyle,
      ])}
      onPress={onPress}
      onActiveStateChange={(active) => setIsPressed(active)}
      enabled={!loading && !disabled}
      activeOpacity={0}
    >
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "flex-row",
            "justify-center",
            "items-center",
            "height-full",
          ]),
          buttonStyle,
        ])}
      >
        {(loading || leftIcon) && (
          <View
            style={style.flatten(
              ["justify-center"],
              [text.length !== 0 && "margin-right-8"]
            )}
          >
            <View>{loading ? loadingSpinner : leftIcon}</View>
          </View>
        )}
        <Text
          style={StyleSheet.flatten([
            style.flatten([textDefinition, "text-center"]),
            { color: style.get(styleDefinition as any).color },
            textStyle,
          ])}
        >
          {text}
        </Text>
        {((loading && !leftIcon && rightIcon) || rightIcon) && (
          <View
            style={style.flatten(
              ["justify-center"],
              [text.length !== 0 && "margin-left-8"]
            )}
          >
            <View>{loading && !leftIcon ? loadingSpinner : rightIcon}</View>
          </View>
        )}
      </View>
    </RectButton>
  );
};
