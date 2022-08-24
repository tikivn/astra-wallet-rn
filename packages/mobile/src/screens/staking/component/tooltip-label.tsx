import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "../../../styles";
import { Popable } from "react-native-popable";

export const TooltipLabel: FunctionComponent<{
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  text: string;
}> = observer(({ textStyle, containerStyle, text }) => {
  const style = useStyle();
  return (
    <Popable content={text}>
      <View
        style={StyleSheet.flatten([
          style.flatten(["flex-row", "justify-start", "items-center"]),
          containerStyle,
        ])}
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten(["color-gray-30", "text-caption2"]),
            textStyle,
          ])}
        >
          {text}
        </Text>
        <View style={style.flatten(["width-20", "height-16", "items-end"])}>
          <Image
            style={style.flatten(["width-16", "height-16"])}
            resizeMode="contain"
            source={require("../../../assets/image/icon_tooltip.png")}
          />
        </View>
      </View>
    </Popable>
  );
});
