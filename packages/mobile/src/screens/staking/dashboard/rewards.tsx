import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { View, Text, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { CardDivider } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";

import { useStyle } from "../../../styles";
import { PropertyView } from "../component/property";

export const RewardsItem: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const smartNavigation = useSmartNavigation();
  const style = useStyle();
  const intl = useIntl();
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

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

  const totalDelegated = priceStore.calculatePrice(delegated);

  const totalReward = priceStore.calculatePrice(pendingStakableReward);

  const isRewardExist = rewardsQueries.rewards.length > 0;

  const isPending = unbondingBalances.length > 0;

  const unboding = unbondingsQueries.total;
  const totalUnboding = priceStore.calculatePrice(unboding);

  return (
    <View
      style={style.flatten(
        [
          "height-184",
          "padding-0",
          "margin-x-16",
          "margin-y-16",
          "justify-between",
          "border-radius-16",
          "border-color-gray-60",
          "border-width-1",
        ],
        [isPending && "height-276"]
      )}
    >
      <View
        style={style.flatten([
          "height-90",
          "padding-y-16",
          "margin-x-16",
          "margin-y-1",
          "flex-row",
        ])}
      >
        <PropertyView
          label={intl.formatMessage({
            id: "staking.dashboard.rewards.totalInvestment",
          })}
          value={delegated
            .shrink(true)
            .maxDecimals(6)
            .trim(true)
            .upperCase(true)
            .toString()}
          subValue={`~ ${
            totalDelegated
              ? totalDelegated.toString()
              : delegated.shrink(true).maxDecimals(6).toString()
          }`}
        />
        <Button
          containerStyle={style.flatten([
            "self-center",
            "border-radius-4",
            // "border-color-gray-30",
            // "border-width-1",
            "width-132",
          ])}
          onPress={() => {
            smartNavigation.navigateSmart("Validator.List", {});
          }}
          text={intl.formatMessage({ id: "staking.dashboard.rewards.invest" })}
          mode="fill"
          size="small"
          underlayColor={style.get("color-background").color}
          textStyle={style.flatten(["color-white", "subtitle3"])}
        />
      </View>
      <CardDivider style={style.flatten(["background-color-gray-70"])} />
      <View
        style={style.flatten([
          "height-90",
          "padding-y-16",
          "margin-x-16",
          "margin-y-1",
          "flex-row",
        ])}
      >
        <PropertyView
          label={intl.formatMessage({
            id: "staking.dashboard.rewards.totalProfit",
          })}
          value={pendingStakableReward
            .shrink(true)
            .maxDecimals(6)
            .trim(true)
            .upperCase(true)
            .toString()}
          subValue={`~ ${
            totalReward
              ? totalReward.toString()
              : pendingStakableReward.shrink(true).maxDecimals(6).toString()
          }`}
          valueStyle={style.flatten(["color-green-50"])}
        />

        <Button
          containerStyle={style.flatten(
            [
              "self-center",
              "border-radius-4",
              "border-color-gray-30",
              "border-width-1",
              "width-132",
            ],
            [!isRewardExist && "opacity-40"]
          )}
          text={intl.formatMessage({
            id: "staking.dashboard.rewards.withdrawProfit",
          })}
          mode="text"
          size="small"
          underlayColor={style.get("color-background").color}
          textStyle={style.flatten(["color-gray-10", "subtitle3"])}
          disabled={!isRewardExist}
          onPress={() => {
            smartNavigation.navigateSmart("Staking.Rewards", {});
          }}
        />
      </View>
      {isPending ? (
        <React.Fragment>
          <CardDivider style={style.flatten(["background-color-gray-70"])} />
          <View
            style={style.flatten([
              "height-90",
              "padding-y-16",
              "margin-x-16",
              "margin-y-1",
              "flex-row",
            ])}
          >
            <PropertyView
              label={intl.formatMessage({
                id: "staking.dashboard.rewards.totalWithdrawals",
              })}
              value={unboding
                .shrink(true)
                .maxDecimals(6)
                .trim(true)
                .upperCase(true)
                .toString()}
              subValue={`~ ${
                totalUnboding
                  ? totalUnboding.toString()
                  : unboding.shrink(true).maxDecimals(6).toString()
              }`}
            />

            <Button
              containerStyle={style.flatten(
                [
                  "self-center",
                  "border-radius-4",
                  "border-color-gray-30",
                  "border-width-1",
                  "width-132",
                ],
                [!isRewardExist && "opacity-40"]
              )}
              text={intl.formatMessage({
                id: "staking.dashboard.rewards.follow",
              })}
              mode="text"
              size="small"
              underlayColor={style.get("color-background").color}
              textStyle={style.flatten(["color-gray-10", "subtitle3"])}
              disabled={!isPending}
              onPress={() => {
                smartNavigation.navigateSmart("Unbonding", {});
              }}
            />
          </View>
        </React.Fragment>
      ) : null}
    </View>
  );
});
