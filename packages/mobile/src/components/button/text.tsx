import React, { FunctionComponent, useState } from "react";
import { Text, TextStyle, ViewStyle } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useStyle } from "../../styles";

export const TextLink: FunctionComponent<{
  onPress?: () => void,
  size?: "large" | "medium" | "small",
  style?: ViewStyle,
  textStyle?: TextStyle,
}> = (({
  size = "large",
  onPress,
  style,
  textStyle,
  ...props
}) => {
  const styleBuilder = useStyle();

  const [isPressed, setIsPressed] = useState(false);
  const textSizeDef = (() => {
    switch (size) {
      case "medium":
        return "text-base-regular";
      case "small":
        return "text-small-regular";
      default:
        break;
    }
    return "text-medium-regular";
  })();

  return (
    <RectButton
      onPress={onPress}
      activeOpacity={0}
      style={style}
      onActiveStateChange={setIsPressed}
    >
      <Text
        style={{
          ...styleBuilder.flatten(
            [
              textSizeDef as any,
              "color-link-text",
              "text-underline",
              "text-center",
            ],
            [isPressed && "color-link-text-active"]),
          ...textStyle,
        }}>
        {props.children}
      </Text>
    </RectButton>
  );
});
