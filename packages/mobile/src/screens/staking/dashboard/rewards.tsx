import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { View, Text, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation";
import { useStore } from "../../../stores";

import { useStyle } from "../../../styles";

export const RewardsItem: FunctionComponent<{
    containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {

    const smartNavigation = useSmartNavigation();
    const style = useStyle();
    const { chainStore, accountStore, queriesStore, priceStore } = useStore();

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const pendingStakableReward = queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
    ).stakableReward;

    const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
        account.bech32Address
    );

    const delegated = queryDelegated.total;

    const totalDelegated = priceStore.calculatePrice(delegated);

    const totalReward = priceStore.calculatePrice(pendingStakableReward);

    // const apy = queries.cosmos.queryInflation.inflation;

    return (
        <View style={style.flatten(["height-184", "padding-0", "margin-x-16", "margin-y-16", "justify-between", "border-radius-16", "border-color-gray-60", "border-width-1"])}>
            <View style={style.flatten(["height-90", "padding-y-16", "margin-x-16", "margin-y-1", "flex-row"])} >
                <View style={style.flatten(["flex-1", "margin-left-0", "items-start"])}>
                    <Text
                        style={style.flatten(["color-gray-80", "subtitle4", "margin-top-0"])}>
                        Tổng đầu tư
                    </Text>
                    <Text
                        style={style.flatten(["color-gray-10", "subtitle2", "margin-y-2"])}>
                        {delegated
                            .shrink(true)
                            .maxDecimals(6)
                            .trim(true)
                            .upperCase(true)
                            .toString()}
                    </Text>
                    <Text
                        style={style.flatten(["color-gray-80", "subtitle4", "margin-bottom-0"])}>
                        ~ {totalDelegated
                            .shrink(true)
                            .maxDecimals(6)
                            .trim(true)
                            .upperCase(true)
                            .toString()}
                    </Text>
                </View>
                <Button containerStyle={style.flatten(["self-center", "border-radius-4", "border-color-gray-30", "border-width-1", "width-132"])}
                    onPress={() => {
                        smartNavigation.navigateSmart("Validator.List.New", {});
                    }}
                    text="Đầu tư ngay"
                    mode="text" size="small"
                    underlayColor={style.get("color-background").color}
                    textStyle={style.flatten(["color-gray-10", "body3"])} />
            </View>
            <View style={style.flatten(["height-1", "background-color-gray-70", "margin-x-16"])} />
            <View style={style.flatten(["height-90", "padding-y-16", "margin-x-16", "margin-y-1", "flex-row"])} >
                <View style={style.flatten(["flex-1", "margin-left-0", "items-start"])}>
                    <Text
                        style={style.flatten(["color-gray-80", "subtitle4", "margin-top-0"])}>
                        Tổng tiền lãi
                    </Text>
                    <Text
                        style={style.flatten(["color-green-50", "subtitle2", "margin-y-2"])}>
                        {pendingStakableReward
                            .shrink(true)
                            .maxDecimals(6)
                            .trim(true)
                            .upperCase(true)
                            .toString()}
                    </Text>
                    <Text
                        style={style.flatten(["color-gray-80", "subtitle4", "margin-bottom-0"])}>
                        ~ {totalReward
                            ? totalReward.toString()
                            : pendingStakableReward.shrink(true).maxDecimals(6).toString()}
                    </Text>
                </View>
                <Button containerStyle={style.flatten(["self-center", "border-radius-4", "border-color-gray-30", "border-width-1", "width-132"])}
                    text="Nhận tiền lãi"
                    mode="text" size="small"
                    underlayColor={style.get("color-background").color}
                    textStyle={style.flatten(["color-gray-10", "body3"])}
                    onPress={() => {
                        smartNavigation.navigateSmart("Staking.Rewards", {});
                    }} />
            </View>

        </View>
    );
});