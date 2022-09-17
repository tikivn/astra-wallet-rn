import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, TextStyle, View, ViewStyle, StyleSheet } from "react-native";
import { useStyle } from "../../styles";
import { ValidatorThumbnail } from "../thumbnail";

export const ValidatorItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  name?: string | undefined;
  thumbnail?: string | undefined;
  value?: string | undefined;
  valueStyle?: TextStyle;
  right?: React.ReactElement;
}> = observer(
  ({ containerStyle, name, thumbnail, value, valueStyle, right }) => {
    const style = useStyle();
    return (
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "border-radius-16",
            "border-width-1",
            "border-color-card-border",
            "padding-x-16",
            "height-56",
            "background-color-card-background",
            "flex-row",
            "items-center",
            "justify-between",
          ]),
          containerStyle,
        ])}
      >
        <View style={style.flatten(["flex-row", "justify-start", "items-center"])}>
          <ValidatorThumbnail
            style={style.flatten(["margin-right-16"])}
            size={24}
            url={thumbnail}
          />
          {name ? (
            <Text
              style={style.flatten([
                "subtitle3",
                "color-gray-10",
                "max-width-160",
              ])}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
          ) : null}
        </View>

        <View style={style.flatten(["flex-row", "justify-end", "items-center"])}>
          {value ? (
            <Text
              style={StyleSheet.flatten([
                style.flatten(["text-caption2", "color-gray-10"]),
                valueStyle,
              ])}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {value}
            </Text>
          ) : null}

          {right ? right : null}
        </View>
      </View>
    );
  }
);
