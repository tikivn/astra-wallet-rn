import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const CannotRedelegateIcon: FunctionComponent = () => {
  return (
    <Svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <Path d="M22 9L30 17H17C13.0218 17 9.20644 18.5804 6.3934 21.3934C3.58035 24.2064 2 28.0218 2 32V32C2 35.9782 3.58035 39.7936 6.3934 42.6066C9.20644 45.4196 13.0218 47 17 47H24" stroke="#818DA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M42 55L34 47H47C50.9782 47 54.7936 45.4196 57.6066 42.6066C60.4196 39.7936 62 35.9782 62 32C62 28.0218 60.4196 24.2064 57.6066 21.3934C54.7936 18.5804 50.9782 17 47 17H40" stroke="#818DA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 59L59 5" stroke="#818DA6" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" />
    </Svg>
  );
};
