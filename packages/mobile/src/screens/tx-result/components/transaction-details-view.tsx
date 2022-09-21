import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { Button, IRow, ListRowView } from "../../../components";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { renderAminoMessages } from "../models/amino";
import { renderDirectMessages } from "../models/direct";
import { MsgSwap } from "../models/messages";

export const TransactionDetailsView: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style }) => {
  const { chainStore, transactionStore, accountStore } = useStore();

  const [hasData] = useState(() => {
    if (transactionStore.txMsgsMode && transactionStore.txMsgs) {
      return true;
    }
    return false;
  });

  const mode = transactionStore.txMsgsMode;
  const chainId = chainStore.current.chainId;
  const chainInfo = chainStore.getChain(chainId);
  const rawData = transactionStore.rawData;

  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  let rows: IRow[] = [];
  if (hasData) {
    if (mode === "amino") {
      console.log("__DEBUG__ render amino");
      rows = renderAminoMessages(
        chainStore.current.chainId,
        accountStore,
        transactionStore
      );
    } else if (mode === "direct") {
      rows = renderDirectMessages();
    }
  }

  const viewDetailsHandler = () => {
    if (chainInfo.raw.txExplorer && transactionStore.txHash) {
      const txHash = Buffer.from(transactionStore.txHash)
        .toString("hex")
        .toUpperCase();
      const url = chainInfo.raw.txExplorer.txUrl.replace("{txHash}", txHash);
      console.log("___URL___", url);
      smartNavigation.pushSmart("WebView", {
        url: url,
      });
    }
  };

  const viewOnAstraExplorer = () => {
    if (chainInfo.raw.txExplorer && transactionStore.rawData) {
      const rawDataValue = transactionStore.rawData.value;
      const transactionHash = (rawDataValue as MsgSwap).transactionHash;
      const url = "https://explorer.astranaut.dev/tx/" + transactionHash;
      smartNavigation.pushSmart("WebView", {
        url: url,
      });
    }
  };

  return (
    <View style={style}>
      {hasData && <ListRowView rows={rows} />}
      {chainInfo && chainInfo.raw.txExplorer && transactionStore.txHash && (
        <Button
          text={intl.formatMessage(
            { id: "tx.result.viewDetails" },
            { page: "Astra Scan" }
          )}
          mode="text"
          containerStyle={{ marginTop: 16 }}
          onPress={viewDetailsHandler}
        />
      )}
      {rawData && rawData.type === "wallet-swap" && (
        <Button
          text={intl.formatMessage(
            { id: "tx.result.viewDetails" },
            { page: "Astra Explorer" }
          )}
          mode="text"
          containerStyle={{ marginTop: 16 }}
          onPress={viewOnAstraExplorer}
        />
      )}
    </View>
  );
};
