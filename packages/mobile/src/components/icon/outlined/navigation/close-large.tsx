import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../../../styles";

export const CloseLargeIcon: FunctionComponent<{
  size?: number;
  color?: string;
  style?: ViewStyle;
}> = ({ size = 24, color, style }) => {
  const styleBuilder = useStyle();
  color = color ?? styleBuilder.get("color-icon-default").color;

  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path
          d="M14.8169 6.06694C15.061 5.82286 15.061 5.42714 14.8169 5.18306C14.5729 4.93898 14.1771 4.93898 13.9331 5.18306L10 9.11612L6.06694 5.18306C5.82286 4.93898 5.42714 4.93898 5.18306 5.18306C4.93898 5.42714 4.93898 5.82286 5.18306 6.06694L9.11612 10L5.18306 13.9331C4.93898 14.1771 4.93898 14.5729 5.18306 14.8169C5.42714 15.061 5.82286 15.061 6.06694 14.8169L10 10.8839L13.9331 14.8169C14.1771 15.061 14.5729 15.061 14.8169 14.8169C15.061 14.5729 15.061 14.1771 14.8169 13.9331L10.8839 10L14.8169 6.06694Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};
