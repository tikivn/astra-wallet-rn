import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { DashboardHeader} from "./header";
import { RewardsItem } from "./rewards";
import { DelegationsItem } from "./delegate";
import { View } from "react-native";
export const NewStakingDashboardScreen: FunctionComponent = () => {
    const { chainStore, accountStore, queriesStore } = useStore();
  
    const style = useStyle();
  
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);
  
    const unbondings = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    ).unbondingBalances;
  
    return (
      <PageWithScrollView backgroundColor={style.get("color-background").color}>
        <DashboardHeader/>
        <RewardsItem/>
        <DelegationsItem containerStyle={style.flatten(["background-color-background"])}/>
        <View style={style.flatten(["height-48"])}></View>
      </PageWithScrollView>
    );
  };