import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../styles";

export const AllIcon: FunctionComponent<{ color?: string }> = ({ color }) => {
  const style = useStyle();
  color = color ?? style.get("color-icon-default").color;

  return (
    <Svg width="5" height="8" viewBox="0 0 5 8" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.808058 1.05806C1.05214 0.813981 1.44786 0.813981 1.69194 1.05806L4.19194 3.55806C4.43602 3.80214 4.43602 4.19787 4.19194 4.44194L1.69194 6.94194C1.44786 7.18602 1.05214 7.18602 0.808058 6.94194C0.563981 6.69787 0.563981 6.30214 0.808058 6.05806L2.86612 4L0.808058 1.94194C0.563981 1.69786 0.563981 1.30214 0.808058 1.05806Z"
        fill={color}
      />
    </Svg>
  );
};
