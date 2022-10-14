import {
  AccountStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  QueriesStore,
  SecretAccount,
  SecretQueries,
} from "@keplr-wallet/stores";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";
import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { StyleSheet, View, ViewStyle } from "react-native";
import { formatCoin, MIN_REWARDS_AMOUNT } from "../../../common/utils";
import { Button } from "../../../components/button";
import { CardDivider } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation-util";
import { ChainStore } from "../../../stores/chain";

import { useStyle } from "../../../styles";
import { PropertyView } from "../component/property";

export const RewardsItem: FunctionComponent<{
  chainStore: ChainStore;
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>;
  queriesStore: QueriesStore<[CosmosQueries, CosmwasmQueries, SecretQueries, KeplrETCQueries]>;
  containerStyle?: ViewStyle;
}> = observer(({ chainStore, accountStore, queriesStore, containerStyle }) => {
  const smartNavigation = useSmartNavigation();
  const style = useStyle();
  const intl = useIntl();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const rewardsQueries = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const pendingStakableReward = rewardsQueries.stakableReward;

  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const unbondingsQueries = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const unbondingBalances = unbondingsQueries.unbondingBalances;

  const delegated = queryDelegated.total;
  const isRewardExist =
    queryDelegated.delegations.filter((delegation) => {
      const stakableRewards = rewardsQueries.getStakableRewardOf(
        delegation.delegation.validator_address
      );
      return stakableRewards.toDec().gte(new Dec(MIN_REWARDS_AMOUNT));
    })?.length !== 0;

  const isPending = unbondingBalances.length > 0;

  const unboding = unbondingsQueries.total;

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "padding-0",
          "margin-x-16",
          "justify-between",
          "background-color-card-background",
          "border-radius-16",
          "border-color-card-border",
          "border-width-1",
        ]),
        containerStyle,
      ])}
    >
      <View
        style={style.flatten([
          "padding-y-16",
          "margin-x-16",
          "margin-y-1",
          "flex-row",
          "items-center",
        ])}
      >
        <PropertyView
          label={intl.formatMessage({
            id: "staking.dashboard.rewards.totalInvestment",
          })}
          value={formatCoin(delegated)}
        />
        <Button
          containerStyle={style.flatten(["width-132"])}
          onPress={() => {
            smartNavigation.navigateSmart("Validator.List", {});
          }}
          text={intl.formatMessage({ id: "staking.dashboard.rewards.invest" })}
          size="medium"
        />
      </View>
      <CardDivider style={style.flatten(["background-color-card-border"])} />
      <View
        style={style.flatten([
          "padding-y-16",
          "margin-x-16",
          "margin-y-1",
          "flex-row",
          "items-center",
        ])}
      >
        <PropertyView
          label={intl.formatMessage({
            id: "staking.dashboard.rewards.totalProfit",
          })}
          value={"+" + formatCoin(pendingStakableReward)}
          valueStyle={style.flatten(["color-rewards-text"])}
        />

        <Button
          containerStyle={style.flatten(["width-132"])}
          text={intl.formatMessage({
            id: "staking.dashboard.rewards.withdrawProfit",
          })}
          color="neutral"
          mode="outline"
          size="medium"
          disabled={!isRewardExist}
          onPress={() => {
            smartNavigation.navigateSmart("Staking.Rewards", {});
          }}
        />
      </View>
      <CardDivider style={style.flatten(["background-color-gray-70"])} />
      <View
        style={style.flatten([
          "padding-y-16",
          "margin-x-16",
          "margin-y-1",
          "flex-row",
          "items-center",
        ])}
      >
        <PropertyView
          label={intl.formatMessage(
            { id: "staking.dashboard.rewards.totalWithdrawals" },
            { denom: unboding.denom }
          )}
          value={formatCoin(unboding)}
        />

        <Button
          containerStyle={style.flatten(["width-132"])}
          text={intl.formatMessage({
            id: "staking.dashboard.rewards.follow",
          })}
          color="neutral"
          mode="outline"
          size="medium"
          disabled={!isPending}
          onPress={() => {
            smartNavigation.navigateSmart("Unbonding", {});
          }}
        />
      </View>
    </View>
  );
});
