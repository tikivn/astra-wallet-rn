import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";

export const WordChip: FunctionComponent<{
  index: number;
  word: string;

  hideWord?: boolean;

  empty?: boolean;
  dashedBorder?: boolean;
}> = ({ index, word, hideWord, empty, dashedBorder }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten(
        [
          "flex-row",
          "padding-x-12",
          "padding-y-4",
          "border-radius-8",
          "background-color-white",
          "border-width-1",
          "border-color-white",
          "margin-right-12",
          "margin-bottom-16",
          "items-center",
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
          ["subtitle3", "color-background", "min-width-40"],
          [empty && "color-primary-100", hideWord && "opacity-transparent"]
        )}
      >
        {empty ? `` : `${word}`}
      </Text>
    </View>
  );
};
