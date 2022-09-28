import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Text, ViewStyle, View } from "react-native";
import { FormattedMessage, useIntl } from "react-intl";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { DelegationsEmptyItem } from "../dashboard/delegate";
import { useSmartNavigation } from "../../../navigation-util";
import { formatCoin, formatUnbondingTime } from "../../../common/utils";

export const UnbondingCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const smartNavigation = useSmartNavigation();
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.find(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );

  const style = useStyle();
  const intl = useIntl();

  const unbondingTime = queries.cosmos.queryStakingParams.unbondingTimeSec ?? 172800;
  const unbondingTimeText = formatUnbondingTime(unbondingTime, intl);

  return unbonding ? (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["margin-top-0", "padding-y-0"])}>
        <View style={style.flatten(["background-color-background"])}>
          <Text
            style={style.flatten([
              "margin-y-8",
              "color-gray-30",
              "text-caption2",
              "text-center",
            ])}
          >
            <FormattedMessage
              id="validator.details.unbonding.noticeWithdrawalPeroid"
              values={{
                coin: chainStore.current.stakeCurrency.coinDenom,
                days: unbondingTimeText,
              }}
            />
            <Text
              style={style.flatten(["text-underline", "color-primary"])}
              onPress={() => {
                smartNavigation.navigateSmart("Wallet.History", {});
              }}
            >
              <FormattedMessage id="validator.details.unbonding.history" />
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
              <FormattedMessage id="validator.details.unbonding.nameAndAmount" />
            </Text>
            <Text style={style.flatten(["color-gray-30", "body3"])}>
              <FormattedMessage id="validator.details.unbonding.receiveAfter" />
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
                .replace(
                  "days",
                  intl.formatMessage({ id: "validator.details.unbonding.days" })
                );
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
            <View key={i}>
              <View
                style={style.flatten([
                  "flex-row",
                  "justify-between",
                  "margin-y-16",
                ])}
              >
                <Text
                  style={style.flatten(["text-base-medium", "color-gray-10"])}
                >
                  {formatCoin(entry.balance)}
                </Text>
                <Text
                  style={style.flatten(["text-base-medium", "color-gray-10"])}
                >
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
      label={intl.formatMessage({ id: "validator.details.unbonding.empty" })}
      containerStyle={style.flatten([
        "background-color-background",
        "margin-y-32",
      ])}
    />
  );
});
