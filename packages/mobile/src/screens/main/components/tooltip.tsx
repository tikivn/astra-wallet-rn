import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "../../../styles";

export const Tooltip: FunctionComponent<{
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  text: string;
  onPress?: (_?: any) => void;
}> = observer(({ textStyle, containerStyle, text, onPress }) => {
  const style = useStyle();
  return (
    <TouchableOpacity
      style={StyleSheet.flatten([
        style.flatten(["flex-row", "justify-start", "items-center"]),
        containerStyle,
      ])}
      onPress={() => onPress && onPress()}
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
    </TouchableOpacity>
  );
});
