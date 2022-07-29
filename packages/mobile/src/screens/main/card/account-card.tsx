import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ViewStyle, Text, View } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { Card, CardBody } from "../../../components/card";
import { AddressCopyableItem } from "../../../components/address-copyable-new";

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
        <View style={style.flatten(["flex-row", "padding-bottom-12"])}>
          <Text
            style={style.flatten(["color-white", "title1", "margin-right-4"])}
          >
            {stakable
              .maxDecimals(6)
              .trim(true)
              .shrink(true)
              .hideDenom(true)
              .toString()}
          </Text>
          <Text style={style.flatten(["color-white", "body3"])}>
            {chainStore.current.stakeCurrency.coinDenom.toUpperCase()}
          </Text>
        </View>
        <Text style={style.flatten(["color-white", "body3"])}>
          ≈{" "}
          {totalPrice
            ? totalPrice.toString()
            : stakable.shrink(true).maxDecimals(6).toString()}
        </Text>
      </CardBody>
      <CardBody style={style.flatten(["padding-bottom-0"])}>
        <AddressCopyableItem
          address={account.bech32Address}
          maxCharacters={22}
        />
      </CardBody>
    </Card>
  );
});
