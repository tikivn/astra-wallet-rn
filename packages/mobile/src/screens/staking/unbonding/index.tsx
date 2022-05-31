import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import { AlertInline, PageWithScrollView } from "../../../components";
import { CardDivider } from "../../../components/card";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useSmartNavigation } from "../../../navigation";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";

export const UnbondingScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbondingsQuery = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const unbondings = unbondingsQuery.unbondingBalances;
  const balance = unbondingsQuery.total;
  const totalUnboding = priceStore.calculatePrice(balance);
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

  const intl = useIntl();

  return (
    <PageWithScrollView
      backgroundColor={Colors["background"]}
      style={style.flatten(["padding-16"])}
      stickyHeaderIndices={[3]}
    >
      <View style={style.flatten(["padding-16", "items-center"])}>
        <Text style={style.flatten(["color-gray-30", "body3", "margin-top-0"])}>
          Tổng số tiền đang rút
        </Text>
        <Text style={style.flatten(["color-gray-10", "title1", "margin-y-2"])}>
          {balance
            .shrink(true)
            .maxDecimals(6)
            .trim(true)
            .upperCase(true)
            .toString()}
        </Text>
        <Text
          style={style.flatten(["color-gray-30", "body3", "margin-bottom-0"])}
        >
          ~
          {totalUnboding
            ? totalUnboding.toString()
            : balance.shrink(true).maxDecimals(6).toString()}
        </Text>
      </View>

      <AlertInline
        type="info"
        content="Sau khi rút ASA, bạn sẽ nhận được số tiền đó sau 14 ngày"
      />
      <Text
        style={style.flatten([
          "margin-y-8",
          "color-gray-30",
          "text-center",
          "text-caption2",
        ])}
      >
        {"Để xem số ASA đã rút thành công vui lòng xem "}
        <Text
          style={style.flatten(["text-underline", "color-primary"])}
          onPress={() => {
            // smartNavigation.navigateSmart("Wallet.History", {});
          }}
        >
          lịch sử
        </Text>
      </Text>
      <View style={style.flatten(["margin-top-16", "background-color-background"])}>
        <View
          style={style.flatten([
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
                  return (
                    intl
                      .formatRelativeTime(relativeEndTimeDays, "days", {
                        numeric: "always",
                      })
                      .replace("in ", "").replace("days", "ngày")
                  );
                } else if (relativeEndTimeHours) {
                  return (
                    intl
                      .formatRelativeTime(relativeEndTimeHours, "hours", {
                        numeric: "always",
                      })
                      .replace("in ", "").replace("hours", "h")
                  );
                }

                return "";
              })();

              return (
                <View style={style.flatten(["height-72"])}>
                  <View style={style.flatten(["flex-row", "justify-between", "margin-y-16"])}>
                    <View style={style.flatten(["flex-row", "justify-start", ])}>
                      <ValidatorThumbnail size={24} url={thumbnail} />
                      <View style={style.flatten(["padding-x-16", "flex"])}>
                        <Text
                          style={style.flatten(["subtitle3", "color-gray-10"])}
                        >
                          {validator?.description.moniker ?? "..."}
                        </Text>
                        <Text
                          style={style.flatten([
                            "text-caption2",
                            "color-gray-10",
                          ])}
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
          </React.Fragment>
        );
      })}
    </PageWithScrollView>
  );
});
