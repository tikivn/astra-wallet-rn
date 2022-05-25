import React, { FunctionComponent, useMemo } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { View, Text } from "react-native";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation";
import { RewardDetails } from "./rewards";

export const StakingRewardScreen: FunctionComponent = () => {
    const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);
  
    const style = useStyle();
    const smartNavigation = useSmartNavigation();
  
    const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    );
    const stakingReward = queryReward.stakableReward;

    const withdrawAllRewards = async () => {
        try {
            await account.cosmos.sendWithdrawDelegationRewardMsgs(
              queryReward.getDescendingPendingRewardValidatorAddresses(8),
              "",
              {},
              {},
              {
                onBroadcasted: (txHash) => {
                  analyticsStore.logEvent("Claim reward tx broadcasted", {
                    chainId: chainStore.current.chainId,
                    chainName: chainStore.current.chainName,
                  });
                  smartNavigation.pushSmart("TxPendingResult", {
                    txHash: Buffer.from(txHash).toString("hex"),
                  });
                },
              }
            );
          } catch (e) {
            if (e?.message === "Request rejected") {
              return;
            }
            console.log(e);
            smartNavigation.navigateSmart("Home", {});
          }
    };

    return (
        <PageWithScrollView backgroundColor={style.get("color-background").color}>
            <View style={style.flatten(["height-32"])}></View>
            <Text style={style.flatten(["color-gray-30", "subtitle3", "text-center"])}>Tổng số tiền lãi</Text>
            <Text style={style.flatten(["color-gray-10", "title1", "text-center", "margin-top-8"])}>
                {stakingReward
                    .shrink(true)
                    .maxDecimals(6)
                    .trim(true)
                    .upperCase(true)
                    .toString()}
            </Text>
            <View style={style.flatten(["height-48"])}></View>
            <View style={style.flatten(["flex-1"])} />
            <RewardDetails containerStyle={style.flatten(["background-color-background"])} />
            <Button
                containerStyle={style.flatten(["border-radius-4", "height-44", "margin-16"])}
                textStyle={style.flatten(["subtitle2"])}
                text="Nhận tiền lãi"
                size="large" onPress={withdrawAllRewards}
                loading={account.txTypeInProgress === "withdrawRewards"}
                />
            {/* Mock element for bottom padding */}
            <View style={style.flatten(["height-page-pad"])} />
        </PageWithScrollView>
    );
};