import React, { FunctionComponent } from "react";
import { StyleSheet, Text, ViewStyle, View } from "react-native";
import { useStyle } from "../../../styles";
import { RectButton } from "../../../components/rect-button";
import { AllIcon } from "../../../components/icon";
import { useSmartNavigation } from "../../../navigation-util";

export const AllAddressItem: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style: propStyle }) => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "padding-left-12",
          "padding-right-8",
          "padding-y-2",
          "background-color-transparent",
          "flex-row",
          "items-center",
          "justify-center",
        ]),
        propStyle,
      ])}
      onPress={() => {
        smartNavigation.navigateSmart("AddressBook", {});
      }}
      rippleColor={style.get("color-transparent").color}
      underlayColor={style.get("color-transparent").color}
      activeOpacity={1}
    >
      <Text style={style.flatten(["subtitle3", "color-white"])}>
        Tất cả ví
      </Text>
      <View style={style.flatten(["margin-left-4", "self-center"])}>
          <AllIcon color={style.get("color-white").color} />
      </View>
    </RectButton>
  );
};