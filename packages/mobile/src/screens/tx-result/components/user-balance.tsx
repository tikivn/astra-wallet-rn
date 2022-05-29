import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AlignItems, IRow, ListRowView, VectorCharacter } from "../../../components";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const UserBalance: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, userBalanceStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const stakable = queryStakable.balance;
  const balance = userBalanceStore.getBalanceString();

  const style = useStyle();

  const currency = stakable.currency;

  const icon = currency.coinImageUrl ? (
    <FastImage
      style={{
        width: 24,
        height: 24,
        margin: 4,
      }}
      resizeMode={FastImage.resizeMode.contain}
      source={{
        uri: currency.coinImageUrl,
      }}
    />
  ) : (
    <VectorCharacter
      char={currency.coinDenom[0]}
      height={Math.floor(24 * 0.35)}
      color="white"
    />
  );

  const rows: IRow[] = [
    {
      type: "items",
      alignItems: AlignItems.center,
      itemSpacing: 8,
      cols: [
        icon,
        <View style={style.flatten(["margin-left-8"])}>
          <Text style={style.flatten(["text-medium-regular", "color-gray-10"])}>Tài sản của tôi</Text>
          <Text style={style.flatten(["text-small-regular", "color-gray-30"])}>Số dư: {balance}</Text>
        </View>
      ],
    }
  ];

  return (
    <ListRowView rows={rows} hideBorder />
  );
});
