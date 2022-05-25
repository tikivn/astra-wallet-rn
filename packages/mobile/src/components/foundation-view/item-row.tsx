import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, useStyle } from "../../styles";
import { TextAlign, TextStyle } from "./text-style";

export enum AlignItems {
  top = "items-start",
  center = "items-center",
  bottom = "items-end"
}

interface IColumn {
  text: string;
  textStyle?: TextStyle;
  textAlign?: TextAlign;
  textColor?: string;
  flex: number;
}

interface IItemRow {
  highlight?: boolean;
  alignItems?: AlignItems;
  itemSpacing?: number;
  columns: IColumn[];
}

export const ItemRow: FunctionComponent<IItemRow> = observer(({
  highlight = false,
  alignItems = AlignItems.top,
  itemSpacing,
  columns,
}) => {
  const style = useStyle();

  var cols = columns.map((column, index) => {
    const {
      text,
      textStyle = TextStyle.baseRegular,
      textAlign = TextAlign.left,
      textColor,
      flex,
    } = column;

    const marginRight = index < columns.length - 1 ? itemSpacing : 0;

    return <Text style={{
      ...style.flatten([textStyle]),
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
      ...style.flatten([alignItems]),
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