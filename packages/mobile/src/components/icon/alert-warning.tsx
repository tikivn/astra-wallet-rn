import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

export const AlertWarningIcon: FunctionComponent<{
  style?: ViewStyle;
  size: number;
  color?: string;
}> = (({
  style,
  size,
  color,
}) => {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path fill-rule="evenodd" clip-rule="evenodd" d="M12 8.25C12.4142 8.25 12.75 8.58579 12.75 9V13.5C12.75 13.9142 12.4142 14.25 12 14.25C11.5858 14.25 11.25 13.9142 11.25 13.5V9C11.25 8.58579 11.5858 8.25 12 8.25Z" fill={color} />
        <Path fill-rule="evenodd" clip-rule="evenodd" d="M10.0052 4.45201C10.8464 2.83971 13.1536 2.83971 13.9948 4.45201L20.5203 16.9592C21.3019 18.4572 20.2151 20.25 18.5255 20.25H5.47447C3.78487 20.25 2.69811 18.4572 3.47966 16.9592L10.0052 4.45201ZM12.6649 5.14586C12.3845 4.60842 11.6154 4.60842 11.335 5.14586L4.80953 17.6531C4.54902 18.1524 4.91127 18.75 5.47447 18.75H18.5255C19.0887 18.75 19.4509 18.1524 19.1904 17.6531L12.6649 5.14586Z" fill={color} />
        <Path d="M12 17.25C12.6213 17.25 13.125 16.7463 13.125 16.125C13.125 15.5037 12.6213 15 12 15C11.3787 15 10.875 15.5037 10.875 16.125C10.875 16.7463 11.3787 17.25 12 17.25Z" fill={color} />
      </Svg>
    </View>
  );
});
