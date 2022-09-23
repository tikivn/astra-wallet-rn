import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";

import { Staking } from "@keplr-wallet/stores";
import { Text, View, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Card, CardBody, CardDivider } from "../../../components/card";

import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TooltipLabel } from "../component";
import { useSmartNavigation } from "../../../navigation-util";
import { FormattedMessage, useIntl } from "react-intl";
import { formatCoin, formatDate, formatPercent } from "../../../common/utils";

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

  let dateText = "";
  if (validator) {
    const date = new Date(validator.commission.update_time);
    dateText = formatDate(date);
  }

  const style = useStyle();

  let totalStakingText = "";
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
        <CardBody style={style.flatten(["padding-y-0"])}>
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
          <View style={style.flatten(["flex-row", "padding-y-24"])}>
            <View style={style.flatten(["items-center", "flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "validator.details.totalShares",
                })}
                textStyle={style.flatten(["text-small-regular"])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "text-x-large-medium",
                  "margin-top-2",
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
            <View style={style.flatten(["items-center", "flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "validator.details.commission",
                })}
                textStyle={style.flatten(["text-small-regular"])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "text-x-large-medium",
                  "margin-top-2",
                ])}
              >
                {formatPercent(validator.commission.commission_rates.rate)}
              </Text>
            </View>
          </View>
          {showStake ? (
            <Button
              containerStyle={style.flatten([
                "margin-bottom-12",
              ])}
              text={intl.formatMessage({ id: "validator.details.invest" })}
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
              "margin-top-24",
            ])}
          >
            <Text
              style={style.flatten(["color-gray-10", "text-base-semi-bold"])}
            >
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
              "margin-top-16",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({ id: "validator.details.maxRate" })}
              textStyle={style.flatten(["text-base-regular"])}
            />
            <Text style={style.flatten(["color-gray-10", "text-base-regular"])}>
              <FormattedMessage
                id="validator.details.percentValue"
                values={{
                  percent: formatPercent(
                    validator.commission.commission_rates.max_rate,
                    true
                  ),
                }}
              />
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-top-16",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({
                id: "validator.details.maxChangeRate",
              })}
              textStyle={style.flatten(["text-base-regular"])}
            />
            <Text style={style.flatten(["color-gray-10", "text-base-regular"])}>
              <FormattedMessage
                id="validator.details.percentValue"
                values={{
                  percent: formatPercent(
                    validator.commission.commission_rates.max_change_rate,
                    true
                  ),
                }}
              />
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-top-16",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({ id: "validator.details.updateTime" })}
              textStyle={style.flatten(["text-base-regular"])}
            />
            <Text style={style.flatten(["color-gray-10", "text-base-regular"])}>
              {dateText}
            </Text>
          </View>
        </CardBody>
      ) : null}
    </Card>
  );
});
