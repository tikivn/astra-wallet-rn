import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { Text, View, ViewStyle, Image } from "react-native";
import { useStyle } from "../../../styles";
import { Staking } from "@keplr-wallet/stores";
import { RightArrowIcon } from "../../../components/icon";
import { useSmartNavigation } from "../../../navigation";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { RectButton } from "../../../components/rect-button";
import { Dec, IntPretty } from "@keplr-wallet/unit";

export const DelegationsItem: FunctionComponent<{
    containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
    const { chainStore, accountStore, queriesStore, priceStore } = useStore();

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const staked = queries.cosmos.queryDelegations.getQueryBech32Address(
        account.bech32Address
    ).total;

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

    const smartNavigation = useSmartNavigation();

    return (
        <Card style={containerStyle}>
            <CardBody style={style.flatten(["padding-bottom-0"])}>
                <Text
                    style={style.flatten([
                        "h5",
                        "color-white",
                        "margin-bottom-0",
                    ])}
                >
                    Quỹ đầu tư của tôi
                </Text>
            </CardBody>

            {delegations && delegations.length > 0 ? (
                <CardBody style={style.flatten(["padding-x-0", "padding-y-14"])}>
                    {delegations.map((del) => {
                        const val = validatorsMap.get(del.delegation.validator_address);
                        if (!val) {
                            return null;
                        }

                        const thumbnail =
                            bondedValidators.getValidatorThumbnail(val.operator_address) ||
                            unbondingValidators.getValidatorThumbnail(val.operator_address) ||
                            unbondedValidators.getValidatorThumbnail(val.operator_address);

                        const amount = queryDelegations.getDelegationTo(
                            val.operator_address
                        );
                        const total = priceStore.calculatePrice(amount);

                        const rewards = queryRewards.getStakableRewardOf(val.operator_address);

                        const totalRewards = priceStore.calculatePrice(rewards);

                        return (
                            <RectButton
                                key={del.delegation.validator_address}
                                style={style.flatten([
                                    "flex-1",
                                    "margin-x-16",
                                    "margin-y-8",
                                    "height-148",
                                    "border-radius-16",
                                    "border-width-1",
                                    "border-color-gray-60",
                                ])}
                                onPress={() => {
                                    smartNavigation.navigateSmart("Validator.Details.New", {
                                        validatorAddress: del.delegation.validator_address,
                                    });
                                }}
                            >
                                <View style={style.flatten(["margin-0", "padding-x-16", "height-56", "background-color-gray-90", "flex-row", "items-center", "justify-between"])}>
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
                                    <View style={style.flatten(["flex-row", "justify-start", "items-center"])}>
                                        <Text
                                            style={style.flatten([
                                                "text-caption2",
                                                "color-gray-10",
                                                "margin-right-8"
                                            ])}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {new IntPretty(
                                                new Dec(val.commission.commission_rates.rate)
                                            )
                                                .decreasePrecision(2)
                                                .maxDecimals(2)
                                                .trim(true)
                                                .toString() + "%"}
                                        </Text>
                                        <RightArrowIcon
                                            height={10}
                                            color={style.get("color-gray-10").color}
                                        />
                                    </View>
                                </View>
                                <CardDivider style={style.flatten(["margin-0", "background-color-gray-60"])} />
                                <View style={style.flatten(["margin-0", "padding-16", "flex-row", "items-center"])}>
                                    <View style={style.flatten(["flex-1", "margin-left-0", "items-start"])}>
                                        <Text
                                            style={style.flatten(["color-gray-80", "subtitle4", "margin-top-0"])}>
                                            Đã đầu tư
                                        </Text>
                                        <Text
                                            style={style.flatten(["color-gray-10", "subtitle2", "margin-y-2"])}>
                                            {amount.maxDecimals(6).trim(true).shrink(true).toString()}
                                        </Text>
                                        <Text
                                            style={style.flatten(["color-gray-80", "subtitle4", "margin-bottom-0"])}>
                                            ~ {total
                                                ? total.toString()
                                                : amount.shrink(true).maxDecimals(6).toString()}

                                        </Text>
                                    </View>
                                    <View style={style.flatten(["flex-1", "margin-left-0", "items-start"])}>
                                        <Text
                                            style={style.flatten(["color-gray-80", "subtitle4", "margin-top-0"])}>
                                            Tiền lãi
                                        </Text>
                                        <Text
                                            style={style.flatten(["color-green-50", "subtitle2", "margin-y-2"])}>
                                            {rewards.maxDecimals(6).trim(true).shrink(true).toString()}
                                        </Text>
                                        <Text
                                            style={style.flatten(["color-gray-80", "subtitle4", "margin-bottom-0"])}>
                                            ~ {totalRewards ? totalRewards.toString()
                                                : rewards.shrink(true).maxDecimals(6).toString()}
                                        </Text>
                                    </View>
                                </View>


                            </RectButton>
                        );
                    })}
                </CardBody>
            ) : (<DelegationsEmptyItem containerStyle={style.flatten(["background-color-background", "margin-y-32"])} />)}
        </Card>
    );
});

export const DelegationsEmptyItem: FunctionComponent<{
    containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
    const style = useStyle();
    return (
        <Card style={containerStyle}>
            <CardBody style={style.flatten(["padding-bottom-0", "items-center"])}>
                <Image source={require("../../../assets/image/empty-order-list.png")} resizeMode="contain" style={style.flatten(["height-60"])}></Image>
                <Text style={style.flatten(["text-center", "text-caption2", "color-gray-30", "margin-top-12"])}>Bạn chưa có quỹ đầu tư nào</Text>
            </CardBody>
        </Card>
    )
});