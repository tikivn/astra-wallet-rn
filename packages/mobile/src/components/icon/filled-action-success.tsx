import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";
import { Colors } from "../../styles";

export const FilledActionIcon: FunctionComponent<{ style?: ViewStyle, color?: string }> = ({
  style,
  color = Colors["blue-70"],
}) => {
  return (
    <View style={style}>
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <G clip-path="url(#clip0_2341_44605)">
          <Path d="M12.25 3C10.47 3 8.72991 3.52784 7.24987 4.51677C5.76983 5.50571 4.61628 6.91131 3.93509 8.55585C3.2539 10.2004 3.07567 12.01 3.42294 13.7558C3.7702 15.5016 4.62737 17.1053 5.88604 18.364C7.14472 19.6226 8.74836 20.4798 10.4942 20.8271C12.24 21.1743 14.0496 20.9961 15.6942 20.3149C17.3387 19.6337 18.7443 18.4802 19.7332 17.0001C20.7222 15.5201 21.25 13.78 21.25 12C21.2431 9.61518 20.2926 7.33002 18.6063 5.64369C16.92 3.95736 14.6348 3.00693 12.25 3ZM11.2803 15.5302C10.9874 15.8231 10.5126 15.8231 10.2197 15.5302L7.21975 12.5302C6.9269 12.2374 6.9269 11.7626 7.21975 11.4697C7.5126 11.1769 7.9874 11.1769 8.28025 11.4697L10.75 13.9395L16.2198 8.46975C16.5126 8.1769 16.9874 8.1769 17.2803 8.46975C17.5731 8.7626 17.5731 9.2374 17.2803 9.53025L11.2803 15.5302Z" fill={color} />
        </G>
        <Defs>
          <ClipPath id="clip0_2341_44605">
            <Rect width="18" height="18" fill="white" transform="translate(3.25 3)" />
          </ClipPath>
        </Defs>
      </Svg>
    </View>
  );
};
