import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Text, ViewStyle, View } from "react-native";
import { useIntl } from "react-intl";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { Staking } from "@keplr-wallet/stores";
import { DelegationsEmptyItem } from "../dashboard/delegate";

export const UnbondingCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.find(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );
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

  return unbonding ? (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["margin-top-0", "padding-y-0"])}>
        <View style={style.flatten(["background-color-background"])}>
          <Text
            style={style.flatten([
              "margin-y-8",
              "color-gray-30",
              "text-center",
              "text-caption2",
            ])}
          >
            {
              "Sau khi rút ASA, bạn sẽ nhận được số tiền đó sau 14 ngày. \nĐể xem số ASA đã rút thành công vui lòng xem "
            }
            <Text
              style={style.flatten(["text-underline", "color-primary"])}
              onPress={() => {
                // smartNavigation.navigateSmart("Wallet.History", {});
              }}
            >
              lịch sử
            </Text>
          </Text>
          <View
            style={style.flatten([
              "margin-top-16",
              "flex-row",
              "justify-between",
              "items-center",
              "margin-bottom-4",
            ])}
          >
            <Text style={style.flatten(["color-gray-30", "body3"])}>
              {"Tên quỹ & số tiền rút"}
            </Text>
            <Text style={style.flatten(["color-gray-30", "body3"])}>
              {"Sẽ nhận được sau"}
            </Text>
          </View>
          <CardDivider
            style={style.flatten(["background-color-gray-70", "margin-x-0"])}
          />
        </View>
        {unbonding.entries.map((entry, i) => {
          const remainingText = (() => {
            const current = new Date().getTime();

            const relativeEndTime =
              (new Date(entry.completionTime).getTime() - current) / 1000;
            const relativeEndTimeDays = Math.floor(
              relativeEndTime / (3600 * 24)
            );
            const relativeEndTimeHours = Math.ceil(relativeEndTime / 3600);

            if (relativeEndTimeDays) {
              return intl
                .formatRelativeTime(relativeEndTimeDays, "days", {
                  numeric: "always",
                })
                .replace("in ", "")
                .replace("days", "ngày");
            } else if (relativeEndTimeHours) {
              return intl
                .formatRelativeTime(relativeEndTimeHours, "hours", {
                  numeric: "always",
                })
                .replace("in ", "")
                .replace("hours", "h");
            }

            return "";
          })();

          return (
            <View style={style.flatten(["height-72"])}>
              <View
                style={style.flatten([
                  "flex-row",
                  "justify-between",
                  "margin-y-16",
                ])}
              >
                <View style={style.flatten(["flex-row", "justify-start"])}>
                  <ValidatorThumbnail size={24} url={thumbnail} />
                  <View style={style.flatten(["padding-x-16", "flex"])}>
                    <Text style={style.flatten(["subtitle3", "color-gray-10"])}>
                      {validator?.description.moniker ?? "..."}
                    </Text>
                    <Text
                      style={style.flatten(["text-caption2", "color-gray-10"])}
                    >
                      {entry.balance
                        .shrink(true)
                        .trim(true)
                        .maxDecimals(6)
                        .toString()}
                    </Text>
                  </View>
                </View>
                <Text style={style.flatten(["subtitle3", "color-gray-10"])}>
                  {remainingText}
                </Text>
              </View>
              <CardDivider
                style={style.flatten([
                  "background-color-gray-70",
                  "margin-x-0",
                ])}
              />
            </View>
          );
        })}
      </CardBody>
    </Card>
  ) : (
    <DelegationsEmptyItem
      label="Bạn chưa có giao dịch rút tiền nào"
      containerStyle={style.flatten([
        "background-color-background",
        "margin-y-32",
      ])}
    />
  );
});
