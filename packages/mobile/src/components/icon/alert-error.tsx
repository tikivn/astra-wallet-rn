import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

export const AlertErrorIcon: FunctionComponent<{
  style?: ViewStyle;
  size: number;
  color?: string;
}> = ({ style, size, color }) => {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path
          d="M10 6.25C10.3452 6.25 10.625 6.52982 10.625 6.875V10.625C10.625 10.9702 10.3452 11.25 10 11.25C9.65482 11.25 9.375 10.9702 9.375 10.625V6.875C9.375 6.52982 9.65482 6.25 10 6.25Z"
          fill={color}
        />
        <Path
          d="M10.625 13.125C10.625 13.4702 10.3452 13.75 10 13.75C9.65482 13.75 9.375 13.4702 9.375 13.125C9.375 12.7798 9.65482 12.5 10 12.5C10.3452 12.5 10.625 12.7798 10.625 13.125Z"
          fill={color}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10ZM10 3.75C6.54822 3.75 3.75 6.54822 3.75 10C3.75 13.4518 6.54822 16.25 10 16.25C13.4518 16.25 16.25 13.4518 16.25 10C16.25 6.54822 13.4518 3.75 10 3.75Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export const ErrorIconV2: FunctionComponent<{
  style?: ViewStyle;
  size: number;
  color?: string;
}> = ({ style, size, color }) => {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <Path
          d="M12.5303 5.46967C12.8232 5.76256 12.8232 6.23744 12.5303 6.53033L10.0607 9L12.5303 11.4697C12.8232 11.7626 12.8232 12.2374 12.5303 12.5303C12.2374 12.8232 11.7626 12.8232 11.4697 12.5303L9 10.0607L6.53033 12.5303C6.23744 12.8232 5.76256 12.8232 5.46967 12.5303C5.17678 12.2374 5.17678 11.7626 5.46967 11.4697L7.93934 9L5.46967 6.53033C5.17678 6.23744 5.17678 5.76256 5.46967 5.46967C5.76256 5.17678 6.23744 5.17678 6.53033 5.46967L9 7.93934L11.4697 5.46967C11.7626 5.17678 12.2374 5.17678 12.5303 5.46967Z"
          fill={color}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0ZM1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};
