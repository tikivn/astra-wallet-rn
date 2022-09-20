import React, { FunctionComponent, ReactElement, useState } from "react";
import { useStyle } from "../../styles";
import { Text, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "../spinner";
import { RectButton } from "../rect-button";

export const Button: FunctionComponent<{
  color?: "primary" | "neutral" | "negative";
  mode?: "fill" | "outline" | "text";
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
  mode = "fill",
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
      }
      else if (isPressed) {
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

    return (
      <View
        style={{
          ...StyleSheet.flatten([
            style.flatten([
              styleDefinition as any,
              `button-${size}-container` as any,
              "overflow-hidden",
            ]),
            containerStyle,
          ]),
        }}
      >
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              "flex-row",
              "justify-center",
              "items-center",
              "height-full",
            ]),
            buttonStyle,
          ])}
          onPress={onPress}
          onActiveStateChange={(active) => setIsPressed(active)}
          enabled={!loading && !disabled}
          activeOpacity={0}
        >
          <View
            style={style.flatten(
              ["height-1", "justify-center"],
              [loading && "opacity-transparent"]
            )}
          >
            <View>{leftIcon}</View>
          </View>
          <Text
            style={StyleSheet.flatten([
              style.flatten(
                [
                  textDefinition,
                  "text-center",
                  // loading && "opacity-transparent"
                ],
              ),
              { color: style.get(styleDefinition as any).color },
              textStyle,
            ])}
          >
            {text}
          </Text>
          <View
            style={style.flatten(
              ["height-1", "justify-center"],
              [loading && "opacity-transparent"]
            )}
          >
            <View>{rightIcon}</View>
          </View>
          {loading ? (
            <View
              style={style.flatten([
                "absolute-fill",
                "justify-center",
                "items-center",
              ])}
            >
              <LoadingSpinner
                color={
                  mode === "fill"// || (mode === "light" && disabled)
                    ? style.get("color-white").color
                    : style.get(
                      `color-button-${color}${disabled ? "-disabled" : ""
                      }` as any
                    ).color
                }
                size={20}
              />
            </View>
          ) : null}
        </RectButton>
      </View>
    );
  };
