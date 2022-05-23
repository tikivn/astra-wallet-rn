import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { useStyle } from "../../styles";

export const HairLine: FunctionComponent = observer(() => {
  const style = useStyle();

  return (
    <View style={style.flatten(["height-1", "margin-8"])} />
  );
});
