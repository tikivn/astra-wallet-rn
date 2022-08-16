import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { ViewStyle, Text } from "react-native";
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
      <CardBody>
        <Text style={style.flatten(["color-white", "text-medium-medium"])}>
          {intl.formatMessage({ id: "main.balance.card.title" })}
        </Text>
        {tokens.map((token) => {
          return (
            <TokenItemNew
              containerStyle={style.flatten(["height-74", "background-color-background-secondary", "border-radius-16"])}
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