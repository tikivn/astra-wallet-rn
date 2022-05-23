import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../../styles";
import AstraIcon from "../../../assets/svg/astra.svg";
import { useStore } from "../../../stores";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "../../../components/vector-character";

interface IUserBalance {
  name: string;
  amount: number;
}

export const UserBalance: FunctionComponent<IUserBalance> = observer(({
  name,
  amount
}) => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const stakable = queryStakable.balance;
  const balance = stakable.trim(true)
  .shrink(true)
  .maxDecimals(6)
  .upperCase(true)
  .hideDenom(true)
  .toString();

  const style = useStyle();

  const currency = stakable.currency;

  const icon = currency.coinImageUrl ? (
    <FastImage
        style={{
            width: 24 * 1,
            height: 24 * 1,
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

  return (
    <View style={styles.container}>
      {icon}
      {/* <AstraIcon width={24} height={24} style={style.flatten(["margin-4"])} /> */}
      <View style={style.flatten(["margin-left-8"])}>
        <Text style={style.flatten(["text-medium-regular", "color-gray-10"])}>{name}</Text>
        <Text style={style.flatten(["text-small-regular", "color-gray-30"])}>Số dư: {balance}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1A2033",
  }
});