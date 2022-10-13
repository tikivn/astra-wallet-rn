import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useStyle } from "../../styles";
import { CloseIcon } from "../icon/16x";

export const WordChip: FunctionComponent<{
  index: number;
  word: string;
  hideWord?: boolean;
  empty?: boolean;
  isInteractive?: boolean;
  onPress?: () => void;
}> = ({ index, word, hideWord, empty, isInteractive, onPress }) => {
  const style = useStyle();

  return (
    <RectButton
      onPress={() => {
        if (isInteractive !== true || !onPress) {
          return;
        }

        onPress();
      }}
    >
      <View
        style={style.flatten(
          [
            "flex-row",
            "padding-left-12",
            "padding-y-4",
            "border-radius-8",
            "background-color-white",
            "border-width-1",
            "border-color-white",
            "margin-right-16",
            "margin-bottom-16",
            "items-center",
            "min-width-80",
          ],
          [empty && "border-color-text-black-low", empty && "background-color-transparent", empty && "border-dashed"]
        )}
      >
        <Text
          style={style.flatten(
            ["text-caption", "color-text-black-low"],
            [hideWord && "opacity-transparent"]
          )}
        >
          {`${index} `}
        </Text>
        <Text
          style={style.flatten(
            ["text-base-medium", "color-background"/*, "min-width-40"*/],
            [empty && "color-primary-100", hideWord && "opacity-transparent"]
          )}
        >
          {empty ? `` : `${word}`}
        </Text>
        {(isInteractive && hideWord !== true && empty !== true)
          ? <CloseIcon style={style.flatten(["margin-x-4"])} />
          : <View style={style.flatten(["width-12"])} />
        }
      </View>
    </RectButton>
  );
};
