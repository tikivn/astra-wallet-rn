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

export const Tooltip: FunctionComponent<{
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  text: string;
}> = observer(({ textStyle, containerStyle, text }) => {
  const style = useStyle();
  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["flex-row", "justify-start", "items-center"]),
        containerStyle,
      ])}
    >
      <Text
        style={StyleSheet.flatten([
          style.flatten(["color-gray-30", "text-caption"]),
          textStyle,
        ])}
      >
        {text}
      </Text>
      <View style={style.flatten(["width-20", "height-16", "items-end"])}>
        <Image
          style={style.flatten(["width-16", "height-16"])}
          resizeMode="contain"
          source={require("../../../assets/image/icon_tooltip_2.png")}
        />
      </View>
    </View>
  );
});
