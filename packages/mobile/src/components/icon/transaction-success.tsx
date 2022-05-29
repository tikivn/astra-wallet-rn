import React, { FunctionComponent } from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import Svg, { Defs, Image, Pattern, Rect, Use } from "react-native-svg";

export const TransactionSuccessIcon: FunctionComponent<{
  containerStyle?: ViewStyle;
  style?: TextStyle & ViewStyle;
}> = ({
  containerStyle,
  style,
}) => {
    return (
      <View style={{ ...containerStyle }}>
        <Svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <Rect x="-63" y="-63" width="327" height="327" fill="url(#pattern0)" />
          <Defs>
            <Pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
              <Use transform="translate(-0.156667) scale(0.00333333)" />
            </Pattern>
            <Image id="image0_319_39268" width="394" height="300" />
          </Defs>
        </Svg>
      </View>
    );
  };
