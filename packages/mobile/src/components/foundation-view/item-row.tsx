import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { TextAlign } from "./text-style";

export enum AlignItems {
  top = "items-start",
  center = "items-center",
  bottom = "items-end",
}

export interface ITextColumn {
  text: string;
  textStyle?: ViewStyle | TextStyle;
  textAlign?: TextAlign;
  textColor?: string;
  flex?: number;
}

export type IColumn = ITextColumn | React.ReactNode;

interface IItemRow {
  style?: ViewStyle;
  highlight?: boolean;
  alignItems?: AlignItems;
  itemSpacing?: number;
  columns: IColumn[];
}

export function buildLeftColumn(config: ITextColumn): IColumn {
  const style = useStyle();

  return {
    text: config.text,
    textStyle: config.textStyle ?? style.get("text-base-regular"),
    textAlign: config.textAlign,
    textColor: config.textColor ?? style.get("color-label-text-2").color,
    flex: config.flex,
  };
}

export function buildRightColumn(config: ITextColumn): IColumn {
  const style = useStyle();

  return {
    text: config.text,
    textStyle: config.textStyle ?? style.get("text-base-regular"),
    textAlign: config.textAlign ?? TextAlign.right,
    textColor: style.get("color-label-text-1").color,
    flex: config.flex ?? 1,
  };
}

export const ItemRow: FunctionComponent<IItemRow> = observer(
  ({
    style,
    highlight = false,
    alignItems = AlignItems.top,
    itemSpacing,
    columns,
  }) => {
    const styleBuilder = useStyle();

    const cols = columns.map((column, index) => {
      const {
        text,
        textStyle = styleBuilder.get("text-base-regular"),
        textAlign = TextAlign.left,
        textColor,
        flex,
      } = column as ITextColumn;

      const key = "row_item_" + index;

      const marginRight = index < columns.length - 1 ? itemSpacing : 0;

      if (text === undefined) {
        return (
          <View
            key={key}
            style={{
              marginRight,
            }}
          >
            {column}
          </View>
        );
      }

      return (
        <Text
          key={key}
          style={{
            ...textStyle,
            ...{
              flex: flex,
              marginRight: marginRight,
              textAlign: textAlign,
              color: textColor,
            },
          }}
        >
          {text}
        </Text>
      );
    });

    return (
      <View
        style={{
          ...styles.itemContainer,
          ...(highlight ? styles.itemHighlight : {}),
          ...styleBuilder.flatten([alignItems]),
          ...style,
        }}
      >
        {cols}
      </View>
    );
  }
);

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
