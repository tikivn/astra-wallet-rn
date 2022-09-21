import React, { FunctionComponent, ReactElement, useState } from "react";
import { useStyle } from "../../styles";
import { Text, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { LoadingSpinner } from "../spinner";
import { RectButton } from "../rect-button";

type ButtonState = "active" | "highlighted" | "disabled";

export const Button: FunctionComponent<{
  color?: "primary" | "secondary" | "danger";
  mode?: "fill" | "light" | "outline" | "text";
  size?: "default" | "small" | "large";
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
  size = "default",
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
      var state: ButtonState = "active";
      if (disabled) {
        state = "disabled";
      }
      else if (isPressed) {
        state = "highlighted";
      }

      switch (mode) {
        // case "fill":
        case "outline":
        case "text":
          return `button-${mode}-${state}`;
        default:
          return `button-${color ?? "primary"}-${state}`;
          // return "background-color-transparent";
      }
    })();

    const textDefinition = (() => {
      switch (size) {
        case "large":
          return "text-medium-medium";
        case "small":
          return "text-base-medium";
        default:
          return "text-medium-medium";
      }
    })();

    // const textColorDefinition = (() => {
    //   switch (mode) {
    //     case "fill":
    //       return "color-white";
    //     case "light":
    //       if (disabled) {
    //         return "color-white";
    //       }
    //       if (isPressed) {
    //         return `color-button-${color}-text-pressed`;
    //       }
    //       return `color-${color}`;
    //     case "outline":
    //     case "text":
    //       if (disabled) {
    //         return `color-button-${color}-disabled`;
    //       }
    //       if (isPressed) {
    //         return `color-button-${color}-text-pressed`;
    //       }
    //       return `color-button-${color}`;
    //   }
    // })();

    return (
      <View
        style={{
          ...StyleSheet.flatten([
            style.flatten(
              [
                styleDefinition as any,
                `button-${size}-container` as any,
                "overflow-hidden",
              ],
              // [
              //   mode === "outline" && "border-width-1",
              //   outlineBorderDefinition as any,
              // ]
            ),
            containerStyle,
          ]),
          // opacity: /*mode === "fill" && */disabled ? 0.4 : 1
        }}
      >
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              "flex-row",
              "justify-center",
              "items-center",
              "height-full",
              "padding-x-8",
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
                // ["text-medium-medium"],
                [
                  textDefinition,
                  "text-center",
                  // textColorDefinition as any,
                  // loading && "opacity-transparent"
                ],
              ),
              {color: style.get(styleDefinition as any).color},
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
                  mode === "fill" || (mode === "light" && disabled)
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
