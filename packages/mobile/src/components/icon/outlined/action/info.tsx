import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

export const InfoIcon: FunctionComponent<{
  size?: number;
  color?: string;
  style?: ViewStyle;
}> = ({
  size = 24,
  color = "#818DA6",
  style,
}) => {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <G clipPath="url(#clip0_2984_166416)">
            <Path
              d="M12.75 11.4199C12.75 11.0057 12.4142 10.6699 12 10.6699C11.5858 10.6699 11.25 11.0057 11.25 11.4199V15.9199C11.25 16.3341 11.5858 16.6699 12 16.6699C12.4142 16.6699 12.75 16.3341 12.75 15.9199V11.4199Z"
              fill={color}
            />
            <Path
              d="M12.75 8.41992C12.75 8.83414 12.4142 9.16992 12 9.16992C11.5858 9.16992 11.25 8.83414 11.25 8.41992C11.25 8.00571 11.5858 7.66992 12 7.66992C12.4142 7.66992 12.75 8.00571 12.75 8.41992Z"
              fill={color}
            />
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 3.16992C7.02944 3.16992 3 7.19936 3 12.1699C3 17.1405 7.02944 21.1699 12 21.1699C16.9706 21.1699 21 17.1405 21 12.1699C21 7.19936 16.9706 3.16992 12 3.16992ZM4.5 12.1699C4.5 8.02779 7.85786 4.66992 12 4.66992C16.1421 4.66992 19.5 8.02779 19.5 12.1699C19.5 16.3121 16.1421 19.6699 12 19.6699C7.85786 19.6699 4.5 16.3121 4.5 12.1699Z"
              fill={color}
            />
          </G>
          <Defs>
            <ClipPath id="clip0_2984_166416">
              <Rect width="18" height="18" fill="white" transform="translate(3 3.16992)" />
            </ClipPath>
          </Defs>
        </Svg>
      </View>
    );
  };
