import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Text, View, ViewStyle, Image } from "react-native";
import { Staking } from "@keplr-wallet/stores";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { DelegationsEmptyItem } from "../dashboard/delegate";

export const RewardDetails: FunctionComponent<{
    containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
    const { chainStore, accountStore, queriesStore } = useStore();

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
        account.bech32Address
    );

    const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
    );

    const delegations = queryDelegations.delegations;

    const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Bonded
    );
    const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Unbonding
    );
    const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Unbonded
    );

    const validators = useMemo(() => {
        return bondedValidators.validators
            .concat(unbondingValidators.validators)
            .concat(unbondedValidators.validators);
    }, [
        bondedValidators.validators,
        unbondingValidators.validators,
        unbondedValidators.validators,
    ]);

    const validatorsMap = useMemo(() => {
        const map: Map<string, Staking.Validator> = new Map();

        for (const val of validators) {
            map.set(val.operator_address, val);
        }

        return map;
    }, [validators]);

    const style = useStyle();

    return (
        <Card style={containerStyle}>
            <CardDivider style={style.flatten(["background-color-gray-70"])} />
            {delegations && delegations.length > 0 ? (
                <CardBody style={style.flatten(["padding-x-0", "padding-y-14"])}>
                    <Text
                        style={style.flatten([
                            "subtitle2",
                            "color-gray-30",
                            "margin-x-16",
                            "margin-bottom-8",
                        ])}
                    >
                        Nhận từ quỹ
                    </Text>
                    {delegations.map((del) => {
                        const val = validatorsMap.get(del.delegation.validator_address);
                        if (!val) {
                            return null;
                        }

                        const thumbnail =
                            bondedValidators.getValidatorThumbnail(val.operator_address) ||
                            unbondingValidators.getValidatorThumbnail(val.operator_address) ||
                            unbondedValidators.getValidatorThumbnail(val.operator_address);

                        const rewards = queryRewards.getStakableRewardOf(val.operator_address);

                        return (
                            <View style={style.flatten(["border-radius-16",
                                "border-width-1",
                                "border-color-gray-60",
                                "margin-x-16",
                                "margin-bottom-8",
                                "padding-x-16",
                                "height-56",
                                "background-color-gray-90",
                                "flex-row",
                                "items-center",
                                "justify-between"])}>
                                <View style={style.flatten(["flex-row", "justify-start"])}>
                                    <ValidatorThumbnail
                                        style={style.flatten(["margin-right-16"])}
                                        size={24}
                                        url={thumbnail}
                                    />
                                    <Text
                                        style={style.flatten([
                                            "subtitle3",
                                            "color-gray-10",
                                            "max-width-160",
                                        ])}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {val.description.moniker}
                                    </Text>
                                </View>

                                <Text
                                    style={style.flatten([
                                        "text-caption2",
                                        "color-gray-10",
                                    ])}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {rewards.maxDecimals(6).trim(true).shrink(true).toString()}
                                </Text>

                            </View>
                        );
                    })}
                </CardBody>
            ) : (<DelegationsEmptyItem containerStyle={style.flatten(["background-color-background", "margin-y-32"])} />)}
        </Card>
    );
});
