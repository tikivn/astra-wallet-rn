import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Text, View } from "react-native";
import { formatCoin, formatUnbondingTime } from "../../../common/utils";
import { AlertInline, PageWithScrollView } from "../../../components";
import { CardDivider } from "../../../components/card";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const UnbondingScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbondingTime =
    queries.cosmos.queryStakingParams.unbondingTimeSec ?? 172800;
  const unbondingTimeText = formatUnbondingTime(unbondingTime, intl);

  const unbondingsQuery = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const unbondings = unbondingsQuery.unbondingBalances;
  const balance = unbondingsQuery.total;
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded
  );

  const style = useStyle();

  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      style={style.flatten(["padding-x-16"])}
      stickyHeaderIndices={[2]}
    >
      <View style={style.flatten(["padding-16", "items-center"])}>
        <Text style={style.flatten(["color-gray-30", "body3", "margin-top-0"])}>
          {intl.formatMessage({ id: "staking.unbonding.totalAmount" })}
        </Text>
        <Text style={style.flatten(["color-gray-10", "title1", "margin-y-2"])}>
          {formatCoin(balance)}
        </Text>
      </View>
      <View style={style.flatten(["background-color-background"])}>
        <AlertInline
          type="info"
          content={intl.formatMessage(
            { id: "staking.unbonding.noticeWithdrawalPeriod" },
            { coin: balance.denom, days: unbondingTimeText }
          )}
        />
        <Text
          style={style.flatten([
            "margin-y-8",
            "color-gray-30",
            "text-center",
            "text-caption2",
          ])}
        >
          {intl.formatMessage(
            { id: "staking.unbonding.viewHistoryGuide" },
            { coin: chainStore.current.stakeCurrency.coinDenom }
          )}
          <Text
            style={style.flatten(["text-underline", "color-primary"])}
            onPress={() => {
              smartNavigation.navigateSmart("Wallet.History", {});
            }}
          >
            {intl.formatMessage({ id: "staking.unbonding.history" })}
          </Text>
        </Text>
      </View>
      <View
        style={style.flatten(["margin-top-16", "background-color-background"])}
      >
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
            {intl.formatMessage({ id: "staking.unbonding.nameAndAmount" })}
          </Text>
          <Text style={style.flatten(["color-gray-30", "body3"])}>
            {intl.formatMessage({ id: "staking.unbonding.receiveAfter" })}
          </Text>
        </View>
        <CardDivider
          style={style.flatten(["background-color-gray-70", "margin-x-0"])}
        />
      </View>
      {unbondings.map((unbonding, unbondingIndex) => {
        const validator = bondedValidators.validators
          .concat(unbondingValidators.validators)
          .concat(unbondedValidators.validators)
          .find((val) => val.operator_address === unbonding.validatorAddress);
        const thumbnail =
          bondedValidators.getValidatorThumbnail(unbonding.validatorAddress) ||
          unbondingValidators.getValidatorThumbnail(
            unbonding.validatorAddress
          ) ||
          unbondedValidators.getValidatorThumbnail(unbonding.validatorAddress);
        const entries = unbonding.entries;

        return (
          <React.Fragment key={unbondingIndex}>
            {entries.map((entry, i) => {
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
                    .replace("sau ", "")
                    .replace(
                      "days",
                      intl.formatMessage({ id: "staking.unbonding.days" })
                    );
                } else if (relativeEndTimeHours) {
                  return intl
                    .formatRelativeTime(relativeEndTimeHours, "hours", {
                      numeric: "always",
                    })
                    .replace("in ", "")
                    .replace("sau ", "")
                    .replace("hours", "h");
                }

                return "";
              })();

              return (
                <View style={style.flatten(["height-72"])} key={i}>
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
                        <Text
                          style={style.flatten([
                            "text-base-medium",
                            "color-gray-10",
                          ])}
                        >
                          {validator?.description.moniker ?? "..."}
                        </Text>
                        <Text
                          style={style.flatten([
                            "text-small-regular",
                            "color-gray-10",
                          ])}
                        >
                          {formatCoin(entry.balance)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={style.flatten([
                        "text-base-medium",
                        "color-gray-10",
                      ])}
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
          </React.Fragment>
        );
      })}
    </PageWithScrollView>
  );
});
