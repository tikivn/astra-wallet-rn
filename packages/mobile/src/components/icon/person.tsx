import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const PersonIcon: FunctionComponent<{
  size: number;
}> = ({ size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M24 12L18 22.3923L6 22.3923L-5.24537e-07 12L6 1.60769L18 1.6077L24 12Z"
        fill="#30CFB4"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 5.07275L8 5.07275L4 12.001L8 18.9292L16 18.9292L20 12.001L16 5.07275ZM15.7113 6.57275L12.5774 12.001L15.7113 17.4292L18.8453 12.001L15.7113 6.57275ZM14.8453 17.9292L11.7113 12.501L5.44338 12.501L8.57735 17.9292L14.8453 17.9292ZM5.44338 11.501L11.7113 11.501L14.8453 6.07275L8.57735 6.07275L5.44338 11.501Z"
        fill="white"
      />
    </Svg>
  );
};
