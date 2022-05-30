import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useStyle } from "../../../styles";

export const PropertyView: FunctionComponent<{
  containerStyle?: ViewStyle;
  label: string;
  value: string;
  subValue: string;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  subValueStyle?: TextStyle;
}> = observer(
  ({
    containerStyle,
    label,
    value,
    subValue,
    labelStyle,
    valueStyle,
    subValueStyle,
  }) => {
    const style = useStyle();
    return (
      <View
        style={StyleSheet.flatten([
          style.flatten(["flex-1", "margin-left-0", "items-start"]),
          containerStyle,
        ])}
      >
        <Text
          style={StyleSheet.flatten([
            style.flatten(["color-gray-80", "subtitle4", "margin-top-0"]),
            labelStyle,
          ])}
        >
          {label}
        </Text>
        <Text
          style={StyleSheet.flatten([
            style.flatten(["color-gray-10", "subtitle2", "margin-y-2"]),
            valueStyle,
          ])}
        >
          {value}
        </Text>
        <Text
          style={StyleSheet.flatten([
            style.flatten(["color-gray-80", "subtitle4", "margin-bottom-0"]),
            subValueStyle,
          ])}
        >
          {subValue}
        </Text>
      </View>
    );
  }
);
