import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Button, IRow, ListRowView } from "../../../components";
import { useStore } from "../../../stores";
import { renderAminoMessages } from "../models/amino";
import { renderDirectMessages } from "../models/direct";
import { useIntl } from "react-intl";
import { useSmartNavigation } from "../../../navigation-util";

export const TransactionDetailsView: FunctionComponent<{
  style?: ViewStyle;
}> = observer(({ style }) => {
  const { chainStore, transactionStore } = useStore();

  const [hasData] = useState(() => {
    if (transactionStore.txMsgsMode && transactionStore.txMsgs) {
      return true;
    }
    return false;
  });

  const mode = transactionStore.txMsgsMode;
  const chainId =
    transactionStore.txData?.chainInfo?.chainId ?? chainStore.current.chainId;
  const chainInfo = chainStore.getChain(chainId);

  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  // useEffect(() => {
  //   if (transactionStore.txMsgsMode && transactionStore.txMsgs) {
  //     setHasData(true);
  //     console.log(
  //       "__MODE__",
  //       transactionStore.txMsgsMode,
  //       transactionStore.txMsgs
  //     );
  //   }
  // }, [transactionStore.txMsgs, transactionStore.txMsgsMode]);

  let rows: IRow[] = [];

  if (hasData) {
    if (mode === "amino") {
      rows = renderAminoMessages();
    } else if (mode === "direct") {
      rows = renderDirectMessages();
    }
  }

  return (
    <View style={style}>
      {hasData && <ListRowView rows={rows} />}
      {chainInfo && chainInfo.raw.txExplorer && transactionStore.txHash && (
        <Button
          size="default"
          text={intl.formatMessage(
            { id: "tx.result.viewDetails" },
            { page: "Astra Scan" }
          )}
          mode="text"
          containerStyle={{ marginTop: 16 }}
          onPress={() => {
            if (chainInfo.raw.txExplorer && transactionStore.txHash) {
              const txHash = Buffer.from(transactionStore.txHash)
                .toString("hex")
                .toUpperCase();
              const url = chainInfo.raw.txExplorer.txUrl.replace(
                "{txHash}",
                txHash
              );
              smartNavigation.navigateSmart("WebView", {
                url: url,
              });
            }
          }}
        />
      )}
    </View>
  );
});
