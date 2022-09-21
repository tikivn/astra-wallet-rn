import React, { FunctionComponent } from "react";
import { Text, ViewStyle } from "react-native";
import { Staking } from "@keplr-wallet/stores";
import { Card, CardBody } from "../../../components/card";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { DelegationsEmptyItem } from "../dashboard/delegate";
import { ValidatorItem } from "../../../components/input";
import { FormattedMessage, useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";
import { ItemRow, TextAlign } from "../../../components";
import { StakableRewards } from ".";

export const RewardDetails: FunctionComponent<{
  stakableRewardsList?: StakableRewards[],
  feeText?: string,
  containerStyle?: ViewStyle;
}> = ({
  stakableRewardsList,
  feeText,
  containerStyle
}) => {
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

    const style = useStyle();
    const intl = useIntl();

    return (
      <Card style={containerStyle}>
        {/* <CardDivider style={style.flatten(["background-color-gray-70"])} /> */}
        {stakableRewardsList && stakableRewardsList.length > 0 ? (
          <CardBody style={style.flatten(["padding-x-0", "padding-y-0", "padding-top-24"])}>
            <Text
              style={style.flatten([
                "subtitle2",
                "color-gray-30",
                "margin-x-16",
                "margin-bottom-8",
              ])}
            >
              <FormattedMessage id="staking.rewards.details.label" />
            </Text>
            {stakableRewardsList.map((stakableRewards, index) => {
              const { validatorName, validatorAddress = "", rewards } = stakableRewards;

              const thumbnail =
                bondedValidators.getValidatorThumbnail(validatorAddress) ||
                unbondingValidators.getValidatorThumbnail(validatorAddress) ||
                unbondedValidators.getValidatorThumbnail(validatorAddress);

              return (
                <ValidatorItem
                  key={index}
                  thumbnail={thumbnail}
                  name={validatorName}
                  value={formatCoin(rewards)}
                  containerStyle={style.flatten([
                    "margin-x-16",
                    "margin-bottom-8",
                  ])}
                />
              );
            })}
          </CardBody>
        ) : (
          <DelegationsEmptyItem
            label={intl.formatMessage({ id: "staking.rewards.details.empty" })}
            containerStyle={style.flatten([
              "background-color-background",
              "margin-y-32",
            ])}
          />
        )}
        <ItemRow
          style={{ paddingVertical: 0, marginTop: 16, marginBottom: 24 }}
          columns={[
            {
              text: intl.formatMessage({ id: "component.amount.input.fee" }),
              textColor: style.get("color-label-text-2").color,
            },
            {
              text: feeText,
              textColor: style.get("color-label-text-1").color,
              textAlign: TextAlign.right,
              flex: 1,
            },
          ]}
        />
      </Card>
    );
  };
