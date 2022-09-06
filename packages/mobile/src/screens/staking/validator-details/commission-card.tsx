import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";

import { Staking } from "@keplr-wallet/stores";
import { Text, View, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { Card, CardBody, CardDivider } from "../../../components/card";

import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TooltipLabel } from "../component";
import { useSmartNavigation } from "../../../navigation-util";
import { FormattedMessage, useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";

export const CommissionsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
  showStake: boolean;
}> = observer(({ containerStyle, validatorAddress, showStake }) => {
  const { chainStore, queriesStore } = useStore();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

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

  let f = "";
  if (validator) {
    const date = new Date(validator.commission.update_time);
    f =
      date.toLocaleTimeString("vi-VN") + " " + date.toLocaleDateString("vi-VN");
  }

  const style = useStyle();

  var totalStakingText = "";
  if (validator) {
    const total = new CoinPretty(
      chainStore.current.stakeCurrency,
      new Dec(validator.tokens)
    );
    totalStakingText = formatCoin(total);
  }

  return (
    <Card style={containerStyle}>
      {validator ? (
        <CardBody style={style.flatten(["padding-y-4"])}>
          {validator.description.details ? (
            <Text
              style={style.flatten(["text-left", "color-gray-10", "body3"])}
            >
              {validator.description.details}
              {validator.description.website ? (
                <Text
                  style={style.flatten(["text-underline", "color-primary"])}
                >
                  {validator.description.website}
                </Text>
              ) : null}
            </Text>
          ) : null}
          <View
            style={style.flatten([
              "flex-row",
              "justify-evenly",
              "padding-y-12",
            ])}
          >
            <View style={style.flatten(["items-center"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "validator.details.totalShares",
                })}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "subtitle2",
                  "margin-y-2",
                ])}
              >
                {totalStakingText}
              </Text>
              {/* <TooltipLabel
                text={intl.formatMessage(
                  { id: "validator.details.votingPower" },
                  { percent: 6.51 }
                )}
              /> */}
            </View>
            <View style={style.flatten(["items-center"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "validator.details.commission",
                })}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "subtitle2",
                  "margin-y-2",
                ])}
              >
                {new IntPretty(
                  new Dec(validator.commission.commission_rates.rate)
                )
                  .moveDecimalPointRight(2)
                  .maxDecimals(2)
                  .trim(true)
                  .toString() + "%"}
              </Text>
            </View>
          </View>
          {showStake ? (
            <Button
              containerStyle={style.flatten([
                "border-radius-4",
                "height-44",
                "margin-bottom-12",
              ])}
              textStyle={style.flatten(["subtitle2"])}
              text={intl.formatMessage({ id: "validator.details.invest" })}
              size="large"
              onPress={() => {
                smartNavigation.navigateSmart("Delegate", {
                  validatorAddress,
                });
              }}
            />
          ) : null}

          <CardDivider
            style={style.flatten(["background-color-gray-70", "margin-x-0"])}
          />
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-top-8",
            ])}
          >
            <Text style={style.flatten(["color-gray-10", "body3"])}>
              {intl.formatMessage({
                id: "validator.details.commission.details",
              })}
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-y-8",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({ id: "validator.details.maxRate" })}
            />
            <Text style={style.flatten(["color-gray-10", "body3"])}>
              <FormattedMessage
                id="validator.details.percentValue"
                values={{
                  percent: new IntPretty(
                    new Dec(validator.commission.commission_rates.max_rate)
                  )
                    .moveDecimalPointRight(2)
                    .maxDecimals(2)
                    .trim(true)
                    .toString(),
                }}
              />
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-bottom-8",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({
                id: "validator.details.maxChangeRate",
              })}
            />
            <Text style={style.flatten(["color-gray-10", "body3"])}>
              <FormattedMessage
                id="validator.details.percentValue"
                values={{
                  percent: new IntPretty(
                    new Dec(
                      validator.commission.commission_rates.max_change_rate
                    )
                  )
                    .moveDecimalPointRight(2)
                    .maxDecimals(2)
                    .trim(true)
                    .toString(),
                }}
              />
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({ id: "validator.details.updateTime" })}
            />
            <Text style={style.flatten(["color-gray-10", "body3"])}>{f}</Text>
          </View>
        </CardBody>
      ) : null}
    </Card>
  );
});
