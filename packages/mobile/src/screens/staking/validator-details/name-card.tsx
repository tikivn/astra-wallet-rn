import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";

import { Staking } from "@keplr-wallet/stores";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { Card, CardBody } from "../../../components/card";

import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TooltipLabel } from "../component";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useIntl } from "react-intl";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Card style={StyleSheet.flatten([
      style.flatten(["background-color-transparent"]),
      containerStyle
    ])}>
      <View style={{
        height: safeAreaInsets.top + 44,
      }} />
      {validator ? (
        <CardBody style={style.flatten([
          "items-center",
          "padding-y-0",
          "margin-top-16",
        ])}>
          <ValidatorThumbnail size={80} url={thumbnail} />
          <Text
            style={style.flatten([
              "subtitle1",
              "color-white",
              "margin-top-16",
            ])}
          >
            {validator.description.moniker}
          </Text>
          <TooltipLabel
            textStyle={style.flatten(["color-white"])}
            containerStyle={style.flatten(["margin-top-4"])}
            text={intl.formatMessage(
              { id: "validator.details.uptime" },
              { percent: "100%" },
            )}
          />
        </CardBody>
      ) : null}
    </Card>
  );
});
