import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";
import { HairLine } from "./hair-line";
import { AlignItems, IColumn, ItemRow } from "./item-row";

export type RowType = "items" | "separator";

export interface IRow {
  type: RowType;
  alignItems?: AlignItems;
  itemSpacing?: number;
  cols?: IColumn[];
}

export const ListRowView: FunctionComponent<{
  style?: ViewStyle;
  rows: IRow[];
  clearBackground?: boolean;
  hideBorder?: boolean;
}> = observer(({ style, rows, clearBackground, hideBorder }) => {
  const styleBuilder = useStyle();

  const items = rows.map((row, index) => {
    return buildItem(row, index);
  });

  function buildItem(row: IRow, index: number): React.ReactNode {
    const key = "row_" + index;
    if (row.type == "separator") {
      return (
        <HairLine
          key={key}
          style={styleBuilder.flatten([
            "background-color-card-border",
            "margin-x-0"
          ])}
        />
      );
    }

    return (
      <ItemRow
        key={key}
        style={{ marginHorizontal: 0, paddingHorizontal: 0 }}
        alignItems={row.alignItems}
        itemSpacing={row.itemSpacing}
        columns={row.cols || []}
      />
    );
  }

  return (
    <View
      style={{
        ...styleBuilder.flatten([
          "border-color-card-border",
          "background-color-card-background",
        ]),
        ...styles.container,
        ...style,
        ...(clearBackground ? { backgroundColor: undefined } : {}),
        ...(hideBorder ? { borderWidth: 0 } : {}),
      }}
    >
      {items}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
