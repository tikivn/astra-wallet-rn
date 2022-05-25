import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { HairLine } from "../../../components/foundation-view/hair-line";
import { AlignItems, ItemRow } from "../../../components/foundation-view/item-row";
import { Colors } from "../../../styles";
import { Typos } from "../../../styles/typos";
import { ITransaction } from "../models/transaction";

export const TransactionDetails: FunctionComponent<ITransaction> = observer(({
  fromAddress,
  toAddress,
  amounts,
  feeAmount,
}) => {
  function item(label?: string, value?: string, labelStyle?: ViewStyle | TextStyle, valueStyle?: ViewStyle | TextStyle, alignItems?: AlignItems): React.ReactNode {
    return <ItemRow
      alignItems={alignItems}
      itemSpacing={12}
      columns={[
        {
          text: label ?? "",
          textStyle: labelStyle ?? Typos["text-base-regular"],
          textColor: Colors["gray-30"],
          flex: 3,
        },
        {
          text: value ?? "",
          textStyle: valueStyle ?? Typos["text-base-regular"],
          textColor: Colors["gray-10"],
          flex: 7,
        },
      ]}
    />;
  }

  function hairlineItem(): React.ReactNode {
    return <HairLine style={{ backgroundColor: Colors["gray-90"], }} />;
  }

  function buildItems() {
    const amountItems = amounts?.map((amount) => {
      return item("Số Astra", amount.toString(), undefined, Typos["text-2x-large-regular"]);
    }) || [];

    const items: React.ReactNode[] = [
      item("Người nhận", toAddress || ""),
      ...amountItems,
      hairlineItem(),
      item("Phí giao dịch", feeAmount?.toString() ?? "", undefined, undefined, AlignItems.center),
    ]

    return items;
  };

  return (
    <View style={styles.container}>
      {buildItems()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#1A2033",
  }
});