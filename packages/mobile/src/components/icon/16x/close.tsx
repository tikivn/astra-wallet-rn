import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

export const CloseIcon: FunctionComponent<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={style}>
      <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <G clipPath="url(#clip0_5236_61360)">
          <Path d="M8 2C4.7 2 2 4.7 2 8C2 11.3 4.7 14 8 14C11.3 14 14 11.3 14 8C14 4.7 11.3 2 8 2ZM10.625 9.575L9.575 10.625L8 9.05L6.425 10.625L5.375 9.575L6.95 8L5.375 6.425L6.425 5.375L8 6.95L9.575 5.375L10.625 6.425L9.05 8L10.625 9.575Z" fill="#979AC2" />
        </G>
        <Defs>
          <ClipPath id="clip0_5236_61360">
            <Rect width="12" height="12" fill="white" transform="translate(2 2)" />
          </ClipPath>
        </Defs>
      </Svg>
    </View>
  );
};
