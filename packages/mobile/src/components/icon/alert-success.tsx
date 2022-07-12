import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

export const AlertSuccessIcon: FunctionComponent<{
  style?: ViewStyle;
  size: number;
  color?: string;
}> = ({ style, size, color }) => {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path
          d="M14.1919 7.94194C14.436 7.69786 14.436 7.30214 14.1919 7.05806C13.9479 6.81398 13.5521 6.81398 13.3081 7.05806L8.75 11.6161L6.69194 9.55806C6.44786 9.31398 6.05214 9.31398 5.80806 9.55806C5.56398 9.80214 5.56398 10.1979 5.80806 10.4419L8.30806 12.9419C8.55214 13.186 8.94786 13.186 9.19194 12.9419L14.1919 7.94194Z"
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
