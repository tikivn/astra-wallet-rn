import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ViewStyle, Text, View } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { Card, CardBody } from "../../../components/card";
import { AddressCopyableItem } from "../../../components/address-copyable";

export const AccountCardNew: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const stakable = queryStakable.balance;
  const totalPrice = priceStore.calculatePrice(stakable);

  return (
    <Card style={containerStyle}>
      <CardBody
        style={style.flatten([
          "padding-bottom-0",
          "justify-center",
          "items-center",
        ])}
      >
        <View style={style.flatten(["flex-row", "padding-bottom-4"])}>
          <Text
            style={style.flatten([
              "color-white",
              "text-4x-large-semi-bold",
              "margin-right-4",
            ])}
          >
            {new Number(stakable.toDec()).toLocaleString("vi-VN", {
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text
            style={style.flatten([
              "color-white",
              "text-base-regular",
              "margin-top-4",
            ])}
          >
            {chainStore.current.stakeCurrency.coinDenom.toUpperCase()}
          </Text>
        </View>
        <Text style={style.flatten(["color-white", "text-base-regular"])}>
          ≈{" "}
          {totalPrice
            ? totalPrice.toString()
            : stakable.shrink(true).maxDecimals(6).toString()}
        </Text>
      </CardBody>
      <View style={{ alignItems: "center" }}>
        <AddressCopyableItem
          style={{ width: 200, marginTop: 4 }}
          address={account.hexAddress}
          maxCharacters={22}
        />
      </View>
    </Card>
  );
});
