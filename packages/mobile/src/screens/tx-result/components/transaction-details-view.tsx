import React, { FunctionComponent, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { Button, IRow, ListRowView } from "../../../components";
import { useStore } from "../../../stores";
import { renderAminoMessages } from "../models/amino";
import { renderDirectMessages } from "../models/direct";
import { useIntl } from "react-intl";
import { useSmartNavigation } from "../../../navigation-util";
import { RectButton } from "react-native-gesture-handler";
import { useStyle } from "../../../styles";

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

  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  let rows: IRow[] = [];
  if (hasData) {
    if (mode === "amino") {
      console.log("__DEBUG__ render amino");
      rows = renderAminoMessages(
        chainStore.current.chainId,
        accountStore,
        transactionStore,
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
      const url = chainInfo.raw.txExplorer.txUrl.replace(
        "{txHash}",
        txHash
      );

      smartNavigation.pushSmart("WebView", {
        url: url,
      });
    }
  };

  return (
    <View style={style}>
      {hasData && <ListRowView rows={rows} />}
      {chainInfo && chainInfo.raw.txExplorer && transactionStore.txHash && (
        <RectButton onPress={viewDetailsHandler} activeOpacity={0}>
          <Text style={styleBuilder.flatten([
            "text-base-regular",
            "color-link-text",
            "text-underline",
            "text-center",
            "margin-y-16"
          ])}>
            {intl.formatMessage(
              { id: "tx.result.viewDetails" },
              { page: chainInfo.raw.txExplorer.name }
            )}
          </Text>
        </RectButton>
      )}
    </View>
  );
};
