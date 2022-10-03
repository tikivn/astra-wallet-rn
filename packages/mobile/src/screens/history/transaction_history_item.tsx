import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, Text } from "react-native";
import { TransactionItem as ITransactionItem } from "./transaction_adapter";
import { RightArrowIcon } from "../../components/icon";
import { useStyle } from "../../styles";
import { CoinPretty } from "@keplr-wallet/unit";
import { ChainStore } from "../../stores/chain";
import moment from "moment";
import { formatCoin } from "../../common/utils";
import { useIntl } from "react-intl";

export const TransactionItem: FunctionComponent<{
  item?: ITransactionItem<any>;
  chainStore: ChainStore;
}> = observer(({ item, chainStore }) => {
  const style = useStyle();
  const intl = useIntl();

  let currency = chainStore.current.currencies.find(
    (cur) => cur.coinMinimalDenom == item?.amount.denom
  );
  var amountText = item?.amount.amount;
  if (currency && item) {
    amountText = formatCoin(new CoinPretty(currency, item?.amount.amount));
  }

  var statusTextColor = style.get("color-yellow-50");
  var statusText = intl.formatMessage({ id: "history.status.unknown" });
  switch (item?.status) {
    case "success":
      statusTextColor = style.get("color-green-50");
      statusText = intl.formatMessage({ id: "history.status.success" });
      break;
    case "failure":
      statusTextColor = style.get("color-red-50");
      statusText = intl.formatMessage({ id: "history.status.failure" });
      break;
  }

  return (
    <View style={style.flatten(["padding-0"])}>
      <View style={style.flatten(["flex-row", "content-stretch"])}>
        <Text
          style={style.flatten(["flex-1", "text-base-medium", "color-gray-10"])}
        >
          {item?.action}
        </Text>
        <Text
          style={style.flatten([
            "text-base-medium",
            "color-gray-10",
            "text-right",
          ])}
        >
          {amountText}
        </Text>
        <View
          style={style.flatten([
            "height-20",
            "width-20",
            "margin-left-8",
            "items-center",
            "justify-center",
          ])}
        >
          <RightArrowIcon height={6.25} />
        </View>
      </View>
      <View
        style={style.flatten(["flex-row", "content-stretch", "margin-top-4"])}
      >
        <Text
          style={style.flatten([
            "flex-1",
            "text-small-regular",
            "color-gray-30",
          ])}
        >
          {moment(item?.timestamp).format("HH:mm - DD/MM/YYYY")}
        </Text>
        <Text
          style={{
            ...style.flatten([
              "text-small-regular",
              "text-right",
              "margin-right-28",
            ]),
            ...statusTextColor,
          }}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
});
