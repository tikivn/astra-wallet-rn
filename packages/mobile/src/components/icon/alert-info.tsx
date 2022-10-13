import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

export const AlertInfoIcon: FunctionComponent<{
  style?: ViewStyle;
  size: number;
  color?: string;
}> = ({ style, size, color }) => {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path
          d="M10.625 9.375C10.625 9.02982 10.3452 8.75 10 8.75C9.65482 8.75 9.375 9.02982 9.375 9.375V13.125C9.375 13.4702 9.65482 13.75 10 13.75C10.3452 13.75 10.625 13.4702 10.625 13.125V9.375Z"
          fill={color}
        />
        <Path
          d="M10.625 6.875C10.625 7.22018 10.3452 7.5 10 7.5C9.65482 7.5 9.375 7.22018 9.375 6.875C9.375 6.52982 9.65482 6.25 10 6.25C10.3452 6.25 10.625 6.52982 10.625 6.875Z"
          fill={color}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5ZM3.75 10C3.75 6.54822 6.54822 3.75 10 3.75C13.4518 3.75 16.25 6.54822 16.25 10C16.25 13.4518 13.4518 16.25 10 16.25C6.54822 16.25 3.75 13.4518 3.75 10Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};
