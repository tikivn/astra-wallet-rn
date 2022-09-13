import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ViewStyle, Text, View } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { Card, CardBody } from "../../../components/card";
import { AddressCopyableItem } from "../../../components/address-copyable";
import { formatCoin } from "../../../common/utils";

export const AccountCardNew: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const stakable = queryStakable.balance;

  return (
    <Card style={containerStyle}>
      <CardBody
        style={style.flatten(["padding-y-0", "justify-center", "items-center"])}
      >
        <Text style={style.flatten(["color-white", "text-4x-large-semi-bold"])}>
          {formatCoin(stakable)}
        </Text>
      </CardBody>
      <View style={{ alignItems: "center" }}>
        <AddressCopyableItem
          style={{ width: 200, marginTop: 6 }}
          address={account.ethereumHexAddress}
          maxCharacters={22}
        />
      </View>
    </Card>
  );
});
