import { Dec } from "@keplr-wallet/unit";
import { useRoute, RouteProp } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { CommissionsCard } from "./commission-card";
import { ValidatorNameCard } from "./name-card";
import { DelegatedCard } from "./delegated-card";
import { ImageBackground, View } from "react-native";
import { LeftArrowIcon } from "../../../components/icon";
import { RectButton } from "../../../components/rect-button";
import { useSmartNavigation } from "../../../navigation";

export const NewValidatorDetailsScreen: FunctionComponent = observer(() => {
    const route = useRoute<
        RouteProp<
            Record<
                string,
                {
                    validatorAddress: string;
                }
            >,
            string
        >
    >();

    const smartNavigation = useSmartNavigation();
    const validatorAddress = route.params.validatorAddress;

    const { chainStore, queriesStore, accountStore } = useStore();

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const staked = queries.cosmos.queryDelegations
        .getQueryBech32Address(account.bech32Address)
        .getDelegationTo(validatorAddress);

    const unbondings = queries.cosmos.queryUnbondingDelegations
        .getQueryBech32Address(account.bech32Address)
        .unbondingBalances.find(
            (unbonding) => unbonding.validatorAddress === validatorAddress
        );

    const style = useStyle();

    const hasStake = staked.toDec().gt(new Dec(0));

    return (
        <View style={style.flatten(["width-full", "height-full", "background-color-background"])}>
            <ImageBackground
                style={style.flatten(["width-full", "height-full"])}
                source={require("../../../assets/logo/main_background.png")}
                resizeMode="contain">
                <PageWithScrollView backgroundColor={style.get("color-transparent").color} stickyHeaderIndices={[0]}>
                    <RectButton
                        style={style.flatten([
                            "border-radius-32",
                            "padding-4",
                            "margin-left-20",
                            "background-color-black-transparent",
                            "width-32",
                            "height-32",
                        ])}
                        onPress={() => {
                            smartNavigation.goBack();
                        }}
                    >
                        <LeftArrowIcon size={24} color={style.get("color-white").color} />
                    </RectButton>
                    <ValidatorNameCard
                        containerStyle={style.flatten(["margin-y-card-gap", "background-color-transparent"])}
                        validatorAddress={validatorAddress}
                    />
                    {hasStake ? (
                        <DelegatedCard
                            containerStyle={style.flatten(["background-color-transparent", "padding-y-0", "background-color-transparent"])}
                            validatorAddress={validatorAddress}
                        />
                    ) : null}
                    <CommissionsCard showStake={!hasStake}
                        containerStyle={style.flatten(["margin-y-card-gap", "background-color-transparent"])}
                        validatorAddress={validatorAddress}
                    />
                </PageWithScrollView>

            </ImageBackground>
        </View>
    );
});
