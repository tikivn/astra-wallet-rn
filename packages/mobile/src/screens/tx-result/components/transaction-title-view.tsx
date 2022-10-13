import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { MsgSwap } from "../models/messages";

export const TransactionTitleView: FunctionComponent = observer(() => {
  const { transactionStore } = useStore();
  const styleBuilder = useStyle();

  const rawData = transactionStore.rawData;
  if (rawData && rawData.type !== "wallet-swap") {
    return null;
  }
  const viewData = rawData?.value as MsgSwap;
  return (
    <View
      style={StyleSheet.flatten([
        styleBuilder.flatten(["items-center", "padding-x-16"]),
        { marginTop: transactionStore.txState === "failure" ? 8 : -16 },
      ])}
    >
      <Text
        style={styleBuilder.flatten([
          "text-success",
          "color-gray-10",
          "text-center",
        ])}
      >
        <FormattedMessage
          id="swap.success.text.from"
          values={{
            // eslint-disable-next-line react/display-name
            b: () => <Text>{viewData.inputAmount}</Text>,
          }}
        />
      </Text>
      <Text
        style={styleBuilder.flatten([
          "text-success",
          "color-gray-10",
          "margin-top-4",
          "text-center",
        ])}
      >
        <FormattedMessage
          id="swap.success.text.to"
          values={{
            // eslint-disable-next-line react/display-name
            b: () => <Text>{viewData.outputAmount}</Text>,
          }}
        />
      </Text>
    </View>
  );
});
