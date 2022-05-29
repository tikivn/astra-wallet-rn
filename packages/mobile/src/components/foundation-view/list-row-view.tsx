import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "../../styles";
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
  style?: ViewStyle,
  rows: IRow[],
  clearBackground?: boolean,
  hideBorder?: boolean
}> = observer(({
  style,
  rows,
  clearBackground,
  hideBorder,
}) => {
  const items = rows.map((row) => {
    return buildItem(row);
  });

  function buildItem(row: IRow): React.ReactNode {
    if (row.type == "separator") {
      return <HairLine style={{ backgroundColor: Colors["gray-70"], marginHorizontal: 0, }} />;
    }

    return <ItemRow
      style={{ marginHorizontal: 0, paddingHorizontal: 0, }}
      alignItems={row.alignItems}
      itemSpacing={row.itemSpacing}
      columns={row.cols || []}
    />;
  }

  return (
    <View style={{
      ...styles.container,
      ...style,
      ...clearBackground ? { backgroundColor: undefined, } : {},
      ...hideBorder ? { borderWidth: 0, } : {},
    }}>
      {items}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors["gray-60"],
    backgroundColor: Colors["gray-90"],
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
