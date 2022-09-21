import React, { FunctionComponent } from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";
import Animated from "react-native-reanimated";
import { useSpinAnimated } from "./hooks";

const SVGLoadingIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_5281_96233)">
        <Path opacity="0.4" fillRule="evenodd" clipRule="evenodd" d="M12 2.4C6.69807 2.4 2.4 6.69807 2.4 12C2.4 17.3019 6.69807 21.6 12 21.6C17.3019 21.6 21.6 17.3019 21.6 12C21.6 6.69807 17.3019 2.4 12 2.4ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z" fill={color} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M10.8 1.2C10.8 0.537258 11.3373 0 12 0C15.1826 0 18.2349 1.26428 20.4853 3.51472C22.7358 5.76515 24 8.8174 24 12C24 12.6627 23.4628 13.2 22.8 13.2C22.1373 13.2 21.6 12.6627 21.6 12C21.6 9.45392 20.5886 7.01212 18.7883 5.21177C16.9879 3.41143 14.5461 2.4 12 2.4C11.3373 2.4 10.8 1.86274 10.8 1.2Z" fill={color} />
      </G>
      <Defs>
        <ClipPath id="clip0_5281_96233">
          <Rect width={size} height={size} fill={color} />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export const LoadingSpinner: FunctionComponent<{
  color: string;
  size: number;

  enabled?: boolean;
}> = ({ color, size, enabled }) => {
  const spinAnimated = useSpinAnimated(enabled ?? true);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [
          {
            rotate: spinAnimated,
          },
        ],
      }}
    >
      <SVGLoadingIcon color={color} size={size} />
    </Animated.View>
  );
};
