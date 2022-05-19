import React, { FunctionComponent } from "react";
import Svg, { Path, Defs, Rect, Stop, LinearGradient, G, Circle, ClipPath } from "react-native-svg";

export const KeplrLogo: FunctionComponent<{
  width?: number | string;
  height?: number | string;
}> = ({ width = 101, height = 101 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 101 101" fill="none">
    <Circle cx="50.6" cy="50.5996" r="50" fill="url(#paint0_linear_115_91)"/>
    <G clip-path="url(#clip0_115_91)">
    <Path d="M57.6087 42.2975H65.2791L50.6 5.59961L35.9209 42.2975H44.4377C45.4599 42.2975 46.3792 41.6751 46.7589 40.726L50.6 31.1231L54.1269 39.9402C54.6963 41.3639 56.0753 42.2975 57.6087 42.2975Z" fill="white"/>
    <Path d="M63.9725 64.5542L50.6 56.6622L37.2275 64.5543L41.638 53.5281C42.0921 52.3928 41.6584 51.0956 40.6128 50.4617L34.2082 46.5791L18.1 86.8496L50.6 67.6691L83.1 86.8495L66.9918 46.5791L60.5872 50.4617C59.5416 51.0956 59.1079 52.3928 59.562 53.5281L63.9725 64.5542Z" fill="white"/>
    </G>
    <Defs>
    <LinearGradient id="paint0_linear_115_91" x1="50.6" y1="34.4458" x2="50.6" y2="99.0611" gradientUnits="userSpaceOnUse">
    <Stop stopColor="#FF424E"/>
    <Stop offset="1" stopColor="#5E5CE6"/>
    </LinearGradient>
    <ClipPath id="clip0_115_91">
    <Rect width="65" height="81.25" fill="white" transform="translate(18.1 5.59961)"/>
    </ClipPath>
    </Defs>
    </Svg>
    
  );
};
