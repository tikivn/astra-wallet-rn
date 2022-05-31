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
import { useSmartNavigation } from "../../../navigation";

export const CommissionsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
  showStake: Boolean;
}> = observer(({ containerStyle, validatorAddress, showStake }) => {
  const { chainStore, queriesStore } = useStore();
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

  var f = "";
  if (validator) {
    const date = new Date(validator.commission.update_time);
    f =
      date.toLocaleTimeString("vi-VN") + " " + date.toLocaleDateString("vi-VN");
  }

  const style = useStyle();

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
              <TooltipLabel text="Tổng số cổ phần" />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "subtitle2",
                  "margin-y-2",
                ])}
              >
                {new CoinPretty(
                  chainStore.current.stakeCurrency,
                  new Dec(validator.tokens)
                )
                  .maxDecimals(6)
                  .toString()}
              </Text>
              <TooltipLabel text="~6,51% quyền biểu quyết" />
            </View>
            <View style={style.flatten(["items-center"])}>
              <TooltipLabel text="Thời gian hoạt động" />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "subtitle2",
                  "margin-y-2",
                ])}
              >
                100%
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
              text="Đầu tư ngay"
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
          ></CardDivider>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-y-8",
            ])}
          >
            <TooltipLabel text="Tối đa" />
            <Text style={style.flatten(["color-gray-10", "body3"])}>
              {new IntPretty(
                new Dec(validator.commission.commission_rates.max_rate)
              )
                .moveDecimalPointRight(2)
                .maxDecimals(2)
                .trim(true)
                .toString() + "%"}
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
            <TooltipLabel text="Thay đổi tối đa mỗi ngày" />
            <Text style={style.flatten(["color-gray-10", "body3"])}>
              {new IntPretty(
                new Dec(validator.commission.commission_rates.max_change_rate)
              )
                .moveDecimalPointRight(2)
                .maxDecimals(2)
                .trim(true)
                .toString() + "%"}
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
            ])}
          >
            <TooltipLabel text="Lần thay đổi cuối cùng" />
            <Text style={style.flatten(["color-gray-10", "body3"])}>{f}</Text>
          </View>
        </CardBody>
      ) : null}
    </Card>
  );
});
