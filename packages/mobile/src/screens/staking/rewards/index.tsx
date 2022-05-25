import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { View, Text } from "react-native";

export const StakingRewardScreen: FunctionComponent = () => {
    const { chainStore, accountStore, queriesStore } = useStore();
  
    const style = useStyle();
  
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);
  
  
    return (
      <PageWithScrollView backgroundColor={style.get("color-background").color}>
          <View style={style.flatten(["height-32"])}></View>
          <Text style={style.flatten(["color-gray-30", "subtitle3", "text-center"])}>Tổng số tiền lãi</Text>
            <View style={style.flatten(["height-48"])}></View>
      </PageWithScrollView>
    );
  };