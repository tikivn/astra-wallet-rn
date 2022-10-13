import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";

export const HairLine: FunctionComponent<{
  style?: ViewStyle,
}> = observer(({style}) => {
  return (
    <View style={{
      height: 1,
      margin: 8,
      ...style,
    }} />
  );
});
