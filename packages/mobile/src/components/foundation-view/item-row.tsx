import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { Typos } from "../../styles/typos";
import { TextAlign } from "./text-style";

export enum AlignItems {
  top = "items-start",
  center = "items-center",
  bottom = "items-end"
}

interface ITextColumn {
  text: string;
  textStyle?: ViewStyle | TextStyle;
  textAlign?: TextAlign;
  textColor?: string;
  flex?: number;
}

type IColumn = ITextColumn | React.ReactNode;

interface IItemRow {
  style?: ViewStyle;
  highlight?: boolean;
  alignItems?: AlignItems;
  itemSpacing?: number;
  columns: IColumn[];
}

export const ItemRow: FunctionComponent<IItemRow> = observer(({
  style,
  highlight = false,
  alignItems = AlignItems.top,
  itemSpacing,
  columns,
}) => {
  const styleBuilder = useStyle();

  var cols = columns.map((column, index) => {
    const {
      text,
      textStyle = Typos["text-base-regular"],
      textAlign = TextAlign.left,
      textColor,
      flex,
    } = column as ITextColumn;

    if (text == undefined) {
      return column;
    }

    const marginRight = index < columns.length - 1 ? itemSpacing : 0;

    return <Text style={{
      ...textStyle,
      ...{
        flex: flex,
        marginRight: marginRight,
        textAlign: textAlign,
        color: textColor,
      },
    }}>{text}</Text>;
  });

  return (
    <View style={{
      ...styles.itemContainer,
      ...highlight ? styles.itemHighlight : {},
      ...styleBuilder.flatten([alignItems]),
      ...style,
    }}>
      {cols}
    </View>
  );
});

const styles = StyleSheet.create({
  itemContainer: {
    margin: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: "row",
  },
  itemHighlight: {
    paddingVertical: 12,
    backgroundColor: "#222940",
  },
});