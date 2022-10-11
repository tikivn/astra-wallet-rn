import { BigNumber } from "@ethersproject/bignumber";
import { ObservableQueryBalanceInner } from "@keplr-wallet/stores";
import { Erc20Currency } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback } from "react";
import { useIntl } from "react-intl";
import { Text, ViewStyle } from "react-native";
import { Card, CardBody } from "../../../components/card";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TokenItemNew } from "./token-item";

type TypeBalances = {
  balanceErc20: CoinPretty;
  isUseBalanceErc20?: boolean;
  item: ObservableQueryBalanceInner;
};

export const BalanceCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const style = useStyle();
  const intl = useIntl();
  const {
    chainStore,
    queriesStore,
    accountStore,
    remoteConfigStore,
  } = useStore();

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );
  const accountHex = accountStore.getAccount(chainStore.current.chainId)
    .ethereumHexAddress;

  const getBalanceErc20 = useCallback(
    (currency: Erc20Currency) => {
      if (!accountHex || !currency.contractAddress) return null;
      const balance = queriesStore
        .get(chainStore.current.chainId)
        .keplrETC.queryERC20Balance.getBalance({
          contractAddress: currency.contractAddress,
          accountHex,
        }).balance;
      if (!balance) {
        return new CoinPretty(currency, new Int(0));
      }
      const bn = BigNumber.from(balance);
      return new CoinPretty(currency, new Int(bn.toString()));
    },
    [accountHex, chainStore, queriesStore]
  );

  const swapEnabled = remoteConfigStore.getBool("feature_swap_enabled");
  let tokens = queryBalances.balances
    .concat(queryBalances.nonNativeBalances)
    .filter((item) => {
      const token = item.currency as Erc20Currency;
      if (token.type === "erc20") {
        const balanceErc20 = getBalanceErc20(token);
        if (swapEnabled && balanceErc20?.toDec().isPositive() === true) {
          return true;
        }
        return false;
      }
      return true;
    })
    .map(
      (item): TypeBalances => {
        const token = item.currency as Erc20Currency;
        const balanceErc20 = getBalanceErc20(token);
        if (token.type === "erc20" && balanceErc20) {
          return { item, balanceErc20, isUseBalanceErc20: true };
        }
        return {
          item,
          balanceErc20: new CoinPretty(item.currency, new Int(0)),
        };
      }
    );

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
                "background-color-card-background",
                "border-radius-16",
              ])}
              key={token.item.currency.coinMinimalDenom}
              chainInfo={chainStore.current}
              balance={
                token.isUseBalanceErc20
                  ? token.balanceErc20
                  : token.item.balance
              }
            />
          );
        })}
      </CardBody>
    </Card>
  );
});
