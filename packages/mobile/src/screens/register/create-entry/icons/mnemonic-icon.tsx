import React, { FunctionComponent } from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

export const MnemonicIcon: FunctionComponent = () => {
  return (
    <Svg width="40" height="41" viewBox="0 0 40 41" fill="none">
      <G clipPath="url(#clip0_3574_92576)">
        <Path fillRule="evenodd" clipRule="evenodd" d="M34.2669 7.67011L19.0529 22.8841L17.2852 21.1164L32.4992 5.90234L34.2669 7.67011Z" fill="#818DA6" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M30.7314 15.17L27.8652 12.3039L29.633 10.5361L34.2669 15.17L28.7491 20.6878L24.1152 16.0539L25.883 14.2861L28.7491 17.1522L30.7314 15.17Z" fill="#818DA6" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M9.32987 22.0005C6.88912 24.4413 6.88912 28.3985 9.32987 30.8393C11.7706 33.28 15.7279 33.28 18.1686 30.8393C20.6094 28.3985 20.6094 24.4413 18.1686 22.0005C15.7279 19.5598 11.7706 19.5598 9.32987 22.0005ZM7.56212 32.607C4.14507 29.19 4.14507 23.6499 7.56212 20.2328C10.9792 16.8157 16.5193 16.8157 19.9364 20.2328C23.3534 23.6499 23.3534 29.19 19.9364 32.607C16.5193 36.0241 10.9792 36.0241 7.56212 32.607Z" fill="#818DA6" />
      </G>
      <Defs>
        <ClipPath id="clip0_3574_92576">
          <Rect width="30" height="30" fill="white" transform="translate(5 5.16992)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};