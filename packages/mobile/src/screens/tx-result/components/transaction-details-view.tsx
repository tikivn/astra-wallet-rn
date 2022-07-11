import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Button, IRow, ListRowView } from "../../../components";
import { useStore } from "../../../stores";
import { renderAminoMessages } from "../models/amino";
import { renderDirectMessages } from "../models/direct";
import * as WebBrowser from "expo-web-browser";

export const TransactionDetailsView: FunctionComponent<{
  style?: ViewStyle;
}> = observer(({ style }) => {
  const { chainStore, transactionStore } = useStore();

  const [hasData, setHasData] = useState(false);
  const mode = transactionStore.txMsgsMode;
  const chainId =
    transactionStore.txData?.chainInfo?.chainId ?? chainStore.current.chainId;
  const chainInfo = chainStore.getChain(chainId);

  useEffect(() => {
    if (transactionStore.txMsgsMode && transactionStore.txMsgs) {
      setHasData(true);
    }
    console.log(
      "__MODE__",
      transactionStore.txMsgsMode,
      transactionStore.txMsgs
    );
  }, [transactionStore.txMsgs, transactionStore.txMsgsMode]);

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
          text="Xem chi tiết trên Astra Scan"
          mode="text"
          containerStyle={{ marginTop: 16 }}
          onPress={() => {
            if (chainInfo.raw.txExplorer && transactionStore.txHash) {
              const txHash = Buffer.from(transactionStore.txHash)
                .toString("hex")
                .toUpperCase();
              WebBrowser.openBrowserAsync(
                chainInfo.raw.txExplorer.txUrl.replace("{txHash}", txHash)
              );
            }
          }}
        />
      )}
    </View>
  );
});
