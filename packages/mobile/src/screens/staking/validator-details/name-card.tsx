
import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";


import { Staking } from "@keplr-wallet/stores";
import { Text, ViewStyle } from "react-native";

import { Dec, IntPretty } from "@keplr-wallet/unit";
import { Card, CardBody } from "../../../components/card";

import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TooltipLabel } from "../component";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useIntl } from "react-intl";

export const ValidatorNameCard: FunctionComponent<{
    containerStyle?: ViewStyle;
    validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
    const { chainStore, queriesStore } = useStore();

    const queries = queriesStore.get(chainStore.current.chainId);

    const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Bonded
    );
    const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Unbonding
    );
    const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Unbonded
    );

    const validator = useMemo(() => {
        return bondedValidators.validators
            .concat(unbondingValidators.validators)
            .concat(unbondedValidators.validators)
            .find((val) => val.operator_address === validatorAddress);
    }, [
        bondedValidators.validators,
        unbondingValidators.validators,
        unbondedValidators.validators,
        validatorAddress,
    ]);

    const thumbnail =
        bondedValidators.getValidatorThumbnail(validatorAddress) ||
        unbondingValidators.getValidatorThumbnail(validatorAddress) ||
        unbondedValidators.getValidatorThumbnail(validatorAddress);


    const style = useStyle();
    const intl = useIntl();

    return (
        <Card style={containerStyle}>
            {validator ? (
                <CardBody style={style.flatten(["items-center"])}>
                    <ValidatorThumbnail
                        style={style.flatten(["margin-right-12"])}
                        size={80}
                        url={thumbnail}
                    />
                    <Text style={style.flatten(["subtitle1", "color-white", "margin-top-16", "margin-bottom-4"])}>
                        {validator.description.moniker}
                    </Text>
                    <TooltipLabel textStyle={style.flatten(["color-green-50"])}
                        text={intl.formatMessage(
                            { id: "validator.details.namecard.commission" },
                            {
                                percent: new IntPretty(new Dec(validator.commission.commission_rates.rate))
                                    .moveDecimalPointRight(2)
                                    .maxDecimals(2)
                                    .trim(true)
                                    .toString()
                            }
                        )} />
                </CardBody>
            ) : null}
        </Card>
    );
});
