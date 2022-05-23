import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { HairLine } from "../../../components/foundation-view/hair-line";
import { AlignItems, ItemRow } from "../../../components/foundation-view/item-row";
import { TextStyle } from "../../../components/foundation-view/text-style";
import { Amount } from "../models/amount";
import { ITransaction } from "../models/transaction";

export const TransactionDetails: FunctionComponent<ITransaction> = observer(({
  fromAddress,
  toAddress,
  amounts,
  feeAmount,
}) => {
  function buildItems() {
    const amountsData = amounts?.map((amount) => {
      return {
        alignCenter: true,
        leftText: "Số Astra", leftTextStyle: TextStyle.baseRegular,
        rightText: amount.toString(), rightTextStyle: TextStyle.x2LargeRegular,
      };
    }) || [];

    const totalAmount = amounts?.reduce((prevAmount, amount) => {
      return prevAmount.adding(amount);
    }).adding(feeAmount ?? Amount.empty());

    console.log("__DEBUG__ total astra:", totalAmount);

    const data: Array<{
      highlight?: boolean;
      alignCenter?: boolean;
      leftText?: string;
      leftTextStyle?: TextStyle;
      rightText?: string;
      rightTextStyle?: TextStyle;
    }> = [
        {
          leftText: "Người nhận", leftTextStyle: TextStyle.baseRegular,
          rightText: `${toAddress}`, rightTextStyle: TextStyle.baseRegular
        },
        ...amountsData,
        {},// hair line
        {
          alignCenter: true,
          leftText: "Phí giao dịch", leftTextStyle: TextStyle.baseRegular,
          rightText: feeAmount?.toString(), rightTextStyle: TextStyle.baseSemiBold,
        },
        {
          highlight: true,
          alignCenter: true,
          leftText: "Tổng cộng", leftTextStyle: TextStyle.baseRegular,
          rightText: totalAmount?.toString(), rightTextStyle: TextStyle.xLargeMedium
        },
      ];

    const items = data.map((d) => {
      const {
        highlight = false,
        alignCenter,
        leftText = "",
        leftTextStyle,
        rightText = "",
        rightTextStyle
      } = d;
      if (!leftText && !rightText) {
        return <HairLine />
      }

      const alignItems = alignCenter ? AlignItems.center : AlignItems.top;

      return <ItemRow
        highlight={highlight}
        alignItems={alignItems}
        itemSpacing={12}
        columns={[
          {
            text: leftText,
            textStyle: leftTextStyle,
            flex: 1
          },
          {
            text: rightText,
            textStyle: rightTextStyle,
            flex: 2
          },
        ]}
      />
    });

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