import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ArrowDownIcon: FunctionComponent<{
  color?: string;
}> = ({ color = "#D5D9E0" }) => {
  return (
    <Svg width="9" height="6" viewBox="0 0 9 6" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.96967 0.96967C1.26256 0.676777 1.73744 0.676777 2.03033 0.96967L4.5 3.43934L6.96967 0.96967C7.26256 0.676777 7.73744 0.676777 8.03033 0.96967C8.32322 1.26256 8.32322 1.73744 8.03033 2.03033L5.03033 5.03033C4.73744 5.32322 4.26256 5.32322 3.96967 5.03033L0.96967 2.03033C0.676777 1.73744 0.676777 1.26256 0.96967 0.96967Z"
        fill={color}
      />
    </Svg>
  );
};
