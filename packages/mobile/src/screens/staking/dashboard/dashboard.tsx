import React, { FunctionComponent, useRef } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStyle } from "../../../styles";
import { DashboardHeader } from "./header";
import { RewardsItem } from "./rewards";
import { DelegationsItem } from "./delegate";
import { RefreshControl, ScrollView, View } from "react-native";
import { useStore } from "../../../stores";
export const StakingDashboardScreen: FunctionComponent = () => {
  const style = useStyle();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const onRefresh = React.useCallback(async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    await Promise.all([
      priceStore.waitFreshResponse(),
      ...queries.queryBalances
        .getQueryBech32Address(account.bech32Address)
        .balances.map((bal) => {
          return bal.waitFreshResponse();
        }),
      queries.cosmos.queryRewards
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryUnbondingDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
    ]);

    setRefreshing(false);
  }, [accountStore, chainStore, priceStore, queriesStore]);

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ref={scrollViewRef}
    >
      <DashboardHeader />
      <RewardsItem
        chainStore={chainStore}
        accountStore={accountStore}
        queriesStore={queriesStore}
        priceStore={priceStore}
      />
      <DelegationsItem
        containerStyle={style.flatten(["background-color-background"])}
        chainStore={chainStore}
        accountStore={accountStore}
        queriesStore={queriesStore}
        priceStore={priceStore}
      />
      <View style={style.flatten(["height-48"])} />
    </PageWithScrollView>
  );
};
