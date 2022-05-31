import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const PersonIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({  size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M24 12L18 22.3923L6 22.3923L-5.24537e-07 12L6 1.60769L18 1.6077L24 12Z"
        fill="#4AB57C"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 5.07292L8 5.07292L4 12.0011L8 18.9293L16 18.9293L20 12.0011L16 5.07292ZM15.7113 6.57292L12.5774 12.0011L15.7113 17.4293L18.8453 12.0011L15.7113 6.57292ZM14.8453 17.9293L11.7113 12.5011L5.44338 12.5011L8.57735 17.9293L14.8453 17.9293ZM5.44338 11.5011L11.7113 11.5011L14.8453 6.07292L8.57735 6.07292L5.44338 11.5011Z"
        fill="white"
      />
    </Svg>
  );
};
