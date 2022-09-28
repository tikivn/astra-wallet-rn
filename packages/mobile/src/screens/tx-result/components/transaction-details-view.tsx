import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { IRow, ListRowView } from "../../../components";
import { TextLink } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { renderAminoMessages } from "../models/amino";
import { renderDirectMessages } from "../models/direct";
import { MsgSwap } from "../models/messages";

export const TransactionDetailsView: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style }) => {
  const styleBuilder = useStyle();

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
        url,
      });
    }
  };

  return (
    <View style={style}>
      {hasData && <ListRowView rows={rows} />}
      {chainInfo && chainInfo.raw.txExplorer && transactionStore.txHash && (
        <TextLink
          size="medium"
          onPress={viewDetailsHandler}
          style={styleBuilder.flatten(["margin-y-16"])}
        >
          {intl.formatMessage(
            { id: "tx.result.viewDetails" },
            { page: chainInfo.raw.txExplorer.name }
          )}
        </TextLink>
      )}
      {rawData && rawData.type === "wallet-swap" && (
        <TextLink
          size="medium"
          onPress={viewOnAstraExplorer}
          style={styleBuilder.flatten(["margin-y-16"])}
        >
          {intl.formatMessage(
            { id: "tx.result.viewDetails" },
            { page: "Astra Explorer" }
          )}
        </TextLink>
      )}
    </View>
  );
};
