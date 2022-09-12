import { AppCurrency, Secret20Currency } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Text, ViewStyle } from "react-native";
import { Card, CardBody } from "../../../components/card";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TokenItemNew } from "./token-item";

export const BalanceCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const style = useStyle();
  const intl = useIntl();
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();

  const priceChange = priceStore.getPriceChangePercent();
  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );
  const account = accountStore.getAccount(chainStore.current.chainId)
    .ethereumHexAddress;

  // queriesStore
  //     .get(chainStore.current.chainId)
  //     .keplrETC.queryERC20Balance.get().balance('');

  // .then((res) => {
  //   console.log("🚀 -> .then -> res", res);
  //   console.log("🚀 -> test ne 2", formatUnits(BigNumber.from(res), "ether"));
  // })
  // .catch((error) => {
  //   console.log("🚀 -> .then -> error", error);
  // });

  // const asd = queryBalances.balances
  //   .concat(queryBalances.nonNativeBalances)
  //   .map((item) => {
  //     const contractAddress = (item.currency as Secret20Currency)
  //       .contractAddress;
  //     if (contractAddress) {
  //       queriesStore
  //         const balance = queriesStore.get(chainStore.current.chainId)
  //         .keplrETC.queryERC20Balance.get()
  //         .balance(contractAddress, account);
  //       return { ...item, balance };
  //     }
  //     return item;
  //   });

  const tokens = queryBalances.balances
    .concat(queryBalances.nonNativeBalances)
    .sort((a, b) => {
      const aDecIsZero = a.balance.toDec().isZero();
      const bDecIsZero = b.balance.toDec().isZero();

      if (aDecIsZero && !bDecIsZero) {
        return 1;
      }
      if (!aDecIsZero && bDecIsZero) {
        return -1;
      }

      return a.currency.coinDenom < b.currency.coinDenom ? -1 : 1;
    });
  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-y-0"])}>
        <Text style={style.flatten(["color-white", "text-medium-medium"])}>
          {intl.formatMessage({ id: "main.balance.card.title" })}
        </Text>
        {tokens.map((token) => {
          return (
            <TokenItemNew
              containerStyle={style.flatten([
                "height-74",
                "background-color-background-secondary",
                "border-radius-16",
              ])}
              key={token.currency.coinMinimalDenom}
              chainInfo={chainStore.current}
              balance={token.balance}
              priceChange={priceChange}
            />
          );
        })}
      </CardBody>
    </Card>
  );
});
