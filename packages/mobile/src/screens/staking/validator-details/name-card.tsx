import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";

import { Staking } from "@keplr-wallet/stores";
import { Image, ImageBackground, Text, View, ViewStyle } from "react-native";

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
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        resizeMode="stretch"
        source={require("../../../assets/image/background_top.png")}
      >
        <View style={style.flatten(["height-104"])} />
        {validator ? (
          <CardBody style={style.flatten(["items-center"])}>
            <ValidatorThumbnail size={80} url={thumbnail} />
            <Text
              style={style.flatten([
                "subtitle1",
                "color-white",
                "margin-top-16",
                "margin-bottom-4",
              ])}
            >
              {validator.description.moniker}
            </Text>
            <TooltipLabel
              textStyle={style.flatten(["color-green-50"])}
              text={intl.formatMessage(
                { id: "validator.details.commission.percent" },
                {
                  percent: new IntPretty(
                    new Dec(validator.commission.commission_rates.rate)
                  )
                    .moveDecimalPointRight(2)
                    .maxDecimals(2)
                    .trim(true)
                    .toString(),
                }
              )}
            />
          </CardBody>
        ) : null}
      </ImageBackground>
    </Card>
  );
});
