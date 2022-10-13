import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

export const ErrorIcon: FunctionComponent<{
  style?: ViewStyle;
  color?: string;
}> = (({
  style,
  color = "#D44E67",
}) => {
  return (
    <View style={style}>
      <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <Path d="M60.5005 110.001C32.9293 110.001 10.5 87.5718 10.5 60.0005C10.5 32.4293 32.9293 10 60.5005 10C88.0718 10 110.501 32.4293 110.501 60.0005C110.501 87.5718 88.0718 110.001 60.5005 110.001Z" fill={color} />
        <Path d="M84.4145 75.2178L69.1969 60.0002L84.4145 44.7827L75.7188 36.0869L60.5012 51.3045L45.2836 36.0869L36.5879 44.7827L51.8054 60.0002L36.5879 75.2178L45.2836 83.9135L60.5012 68.696L75.7188 83.9135L84.4145 75.2178Z" fill="white" />
      </Svg>
    </View>
  );
});
