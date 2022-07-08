import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ExpandIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 20, color }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.05806 8.30806C7.30214 8.06398 7.69786 8.06398 7.94194 8.30806L10 10.3661L12.0581 8.30806C12.3021 8.06398 12.6979 8.06398 12.9419 8.30806C13.186 8.55214 13.186 8.94786 12.9419 9.19194L10.4419 11.6919C10.1979 11.936 9.80214 11.936 9.55806 11.6919L7.05806 9.19194C6.81398 8.94786 6.81398 8.55214 7.05806 8.30806Z"
        fill={color}
      />
    </Svg>
  );
};

export const CollapseIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size = 20, color }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.55806 8.30806C9.80214 8.06398 10.1979 8.06398 10.4419 8.30806L12.9419 10.8081C13.186 11.0521 13.186 11.4479 12.9419 11.6919C12.6979 11.936 12.3021 11.936 12.0581 11.6919L10 9.63388L7.94194 11.6919C7.69786 11.936 7.30214 11.936 7.05806 11.6919C6.81398 11.4479 6.81398 11.0521 7.05806 10.8081L9.55806 8.30806Z"
        fill={color}
      />
    </Svg>
  );
};
