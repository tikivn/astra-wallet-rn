import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ToastIcon: FunctionComponent<{
  color?: string;
  height: number;
}> = ({ color = "#3B99FC", height }) => {
  return (
    <Svg width={height} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 4.25C8.34518 4.25 8.625 4.52982 8.625 4.875V8.625C8.625 8.97018 8.34518 9.25 8 9.25C7.65482 9.25 7.375 8.97018 7.375 8.625V4.875C7.375 4.52982 7.65482 4.25 8 4.25Z"
        fill={color}
      />
      <Path
        d="M8.625 11.125C8.625 11.4702 8.34518 11.75 8 11.75C7.65482 11.75 7.375 11.4702 7.375 11.125C7.375 10.7798 7.65482 10.5 8 10.5C8.34518 10.5 8.625 10.7798 8.625 11.125Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8ZM8 1.75C4.54822 1.75 1.75 4.54822 1.75 8C1.75 11.4518 4.54822 14.25 8 14.25C11.4518 14.25 14.25 11.4518 14.25 8C14.25 4.54822 11.4518 1.75 8 1.75Z"
        fill={color}
      />
    </Svg>
  );
};
