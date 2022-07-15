import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Text, ViewStyle } from "react-native";
import { Staking } from "@keplr-wallet/stores";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { DelegationsEmptyItem } from "../dashboard/delegate";
import { ValidatorItem } from "../../../components/input";
import { FormattedMessage, useIntl } from "react-intl";

export const RewardDetails: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );

  const delegations = queryDelegations.delegations;

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );
  const unbondingValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonding
  );
  const unbondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unbonded
  );

  const validators = useMemo(() => {
    return bondedValidators.validators
      .concat(unbondingValidators.validators)
      .concat(unbondedValidators.validators);
  }, [
    bondedValidators.validators,
    unbondingValidators.validators,
    unbondedValidators.validators,
  ]);

  const validatorsMap = useMemo(() => {
    const map: Map<string, Staking.Validator> = new Map();

    for (const val of validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [validators]);

  const style = useStyle();
  const intl = useIntl();

  return (
    <Card style={containerStyle}>
      <CardDivider style={style.flatten(["background-color-gray-70"])} />
      {delegations && delegations.length > 0 ? (
        <CardBody style={style.flatten(["padding-x-0", "padding-y-14"])}>
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
          {delegations.map((del, index) => {
            const val = validatorsMap.get(del.delegation.validator_address);
            if (!val) {
              return null;
            }

            const thumbnail =
              bondedValidators.getValidatorThumbnail(val.operator_address) ||
              unbondingValidators.getValidatorThumbnail(val.operator_address) ||
              unbondedValidators.getValidatorThumbnail(val.operator_address);

            const rewards = queryRewards.getStakableRewardOf(
              val.operator_address
            );

            return (
              <ValidatorItem
                key={index}
                thumbnail={thumbnail}
                name={val.description.moniker}
                value={rewards
                  .maxDecimals(6)
                  .trim(true)
                  .shrink(true)
                  .toString()}
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
    </Card>
  );
});
