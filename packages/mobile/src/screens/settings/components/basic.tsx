import React, { FunctionComponent } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useStyle } from "../../../styles";
 
 export const AccountItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  paragraphStyle?: TextStyle;

  label: string;
  paragraph?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;

  onPress?: () => void;

}> = ({
  containerStyle,
  style: propStyle,
  labelStyle,
  paragraphStyle,
  label,
  paragraph,
  left,
  right,
  onPress,
}) => {
  const style = useStyle();

  const renderChildren = () => {
    return (
      <React.Fragment>
        {left}
        <View>
          <Text
            style={StyleSheet.flatten([
              style.flatten(["body3", "color-white"]),
              labelStyle,
            ])}
          >
            {label}
          </Text>
          {paragraph ? (
            <Text
              style={StyleSheet.flatten([
                style.flatten(["body3", "color-text-black-low"]),
                paragraphStyle,
              ])}
            >
              {paragraph}
            </Text>
          ) : null}
        </View>
        {right ? (
          <React.Fragment>
            <View style={style.flatten(["flex-1"])} />
            {right}
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <View style={containerStyle}>
      {onPress ? (
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              "background-color-background-secondary",
              "height-48",
              "padding-left-16",
              "padding-right-16",
              "flex-row",
              "items-center",
              "border-radius-8",
            ]),
            propStyle,
          ])}
          onPress={onPress}
        >
          {renderChildren()}
        </RectButton>
      ) : (
        <View
          style={StyleSheet.flatten([
            style.flatten([ 
              "background-color-background-secondary",
              "height-48",
              "padding-left-16",
              "flex-row",
              "items-center",
              "border-radius-8",
            ]),
            propStyle,
          ])}
        >
          {renderChildren()}
        </View>
      )}
    </View>
  );
};
