import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStyle } from "../../../styles";
import { DashboardHeader } from "./header";
import { RewardsItem } from "./rewards";
import { DelegationsItem } from "./delegate";
import { View } from "react-native";
export const StakingDashboardScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <PageWithScrollView backgroundColor={style.get("color-background").color}>
      <DashboardHeader />
      <RewardsItem />
      <DelegationsItem
        containerStyle={style.flatten(["background-color-background"])}
      />
      <View style={style.flatten(["height-48"])} />
    </PageWithScrollView>
  );
};
