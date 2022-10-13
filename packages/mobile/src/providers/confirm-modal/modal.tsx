import React, { FunctionComponent } from "react";
import { registerModal } from "../../modals/base";
import { useStyle } from "../../styles";
import { Text, View } from "react-native";
import { Button } from "../../components/button";
export const ConfirmModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;

  title: string;
  paragraph?: string;

  yesButtonText: string;
  noButtonText: string;

  onSelectYes: () => void;
  onSelectNo: () => void;
}> = registerModal(
  ({
    close,
    title,
    paragraph,
    yesButtonText,
    noButtonText,
    onSelectYes,
    onSelectNo,
  }) => {
    const style = useStyle();

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            "background-color-gray-90",
            // "padding-x-16",
            "padding-y-12",
            "border-width-1",
            "border-color-gray-60",
          ])}
        >
          {title.length > 0 ? (
            <Text
              style={style.flatten([
                "h3",
                "color-text-black-medium",
                "margin-bottom-8",
              ])}
            >
              {title}
            </Text>
          ) : null}
          {paragraph ? (
            <Text
              style={style.flatten([
                "subtitle2",
                "color-gray-10",
                "margin-left-16",
              ])}
            >
              {paragraph}
            </Text>
          ) : null}
          <View
            style={style.flatten([
              "background-color-gray-60",
              "margin-y-12",
              "margin-x-0",
              "height-1",
            ])}
          />
          <View style={style.flatten(["flex-row", "padding-x-16"])}>
            <Button
              containerStyle={style.flatten([
                "flex-1",
                "background-color-gray-70",
              ])}
              text={noButtonText}
              onPress={() => {
                onSelectNo();
                close();
              }}
            />
            <View style={style.flatten(["width-12"])} />
            <Button
              color="negative"
              containerStyle={style.flatten(["flex-1"])}
              text={yesButtonText}
              onPress={() => {
                onSelectYes();
                close();
              }}
            />
          </View>
        </View>
      </View>
    );
  },
  {
    align: "center",
  }
);
