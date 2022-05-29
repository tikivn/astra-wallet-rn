import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { AlignItems, buildLeftColumn, buildRightColumn, HairLine, IRow, ListRowView, TextAlign } from "../../../components";
import { Colors, Typos } from "../../../styles";
import { ITransaction } from "../models/transaction";

export const TransactionDetails: FunctionComponent<ITransaction> = observer(({
  fromAddress,
  toAddress,
  amounts,
  feeAmount,
}) => {
  const common: {
    type: "items" | "separator",
    alignItems: AlignItems
  } = {
    type: "items",
    alignItems: AlignItems.center
  };

  const amountRows = amounts?.map((amount): IRow => {
    return {
      ...common,
      cols: [
        buildLeftColumn({ text: "Số Astra", flex: 3, }),
        buildRightColumn({ 
          text: amount.toString(), 
          textStyle: Typos["text-2x-large-regular"], 
          textAlign: TextAlign.left, 
          flex: 7,
        }),
      ],
    };
  }) || [];

  var rows: IRow[] = [
    { type: "items", cols: [buildLeftColumn({ text: "Người nhận", flex: 3, }), buildRightColumn({ text: toAddress || "", textAlign: TextAlign.left, flex: 7, })], },
    ...amountRows,
    { ...common, cols: [<HairLine style={{ backgroundColor: Colors["gray-90"], }} />] },
    { ...common, cols: [buildLeftColumn({ text: "Phí giao dịch", flex: 3, }), buildRightColumn({ text: feeAmount?.toString() ?? "", textAlign: TextAlign.left, flex: 7, })], },
  ]

  return (
    <ListRowView style={{ marginTop: 16, }} rows={rows} hideBorder />
  );
});
