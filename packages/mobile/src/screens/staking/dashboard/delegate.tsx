import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { Text, View, ViewStyle, Image } from "react-native";
import { useStyle } from "../../../styles";
import {
  AccountStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  QueriesStore,
  SecretAccount,
  SecretQueries,
  Staking,
} from "@keplr-wallet/stores";
import { ChainStore } from "../../../stores/chain";
import { RightArrowIcon } from "../../../components/icon";
import { useSmartNavigation } from "../../../navigation-util";
import { RectButton } from "../../../components/rect-button";
import { PropertyView } from "../component/property";
import { ValidatorItem } from "../../../components/input";
import { FormattedMessage, useIntl } from "react-intl";
import { formatCoin, formatPercent } from "../../../common/utils";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";

export const DelegationsItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  chainStore: ChainStore;
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>;
  queriesStore: QueriesStore<[CosmosQueries, CosmwasmQueries, SecretQueries, KeplrETCQueries]>;
}> = observer(
  ({ containerStyle, chainStore, accountStore, queriesStore }) => {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );

    const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    );

    const delegations = queryDelegations.delegations.sort((a, b) => {
      return Number(b.balance.amount) - Number(a.balance.amount);
    });

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

    const smartNavigation = useSmartNavigation();

    return (
      <Card style={containerStyle}>
        <CardBody style={style.flatten(["padding-y-0"])}>
          <Text style={style.flatten(["text-large-semi-bold", "color-white"])}>
            <FormattedMessage id="staking.delegate.label" />
          </Text>
        </CardBody>

        {delegations && delegations.length > 0 ? (
          <CardBody style={style.flatten([
            "padding-x-0",
            "padding-y-0",
            "padding-bottom-16",
          ])}>
            {delegations.map((del) => {
              const val = validatorsMap.get(del.delegation.validator_address);
              if (!val) {
                return null;
              }

              const thumbnail =
                bondedValidators.getValidatorThumbnail(val.operator_address) ||
                unbondingValidators.getValidatorThumbnail(
                  val.operator_address
                ) ||
                unbondedValidators.getValidatorThumbnail(val.operator_address);

              const amount = queryDelegations.getDelegationTo(
                val.operator_address
              );

              const rewards = queryRewards.getStakableRewardOf(
                val.operator_address
              );

              return (
                <RectButton
                  key={del.delegation.validator_address}
                  style={style.flatten([
                    "flex",
                    "margin-x-16",
                    "margin-top-16",
                    "border-radius-16",
                    "border-width-1",
                    "border-color-gray-60",
                  ])}
                  onPress={() => {
                    smartNavigation.navigateSmart("Validator.Details", {
                      validatorAddress: del.delegation.validator_address,
                    });
                  }}
                >
                  <ValidatorItem
                    containerStyle={style.flatten([
                      "background-color-card-background-header",
                      "border-width-0",
                      "border-radius-0",
                    ])}
                    thumbnail={thumbnail}
                    name={val.description.moniker}
                    value={
                      intl.formatMessage(
                        { id: "validator.details.commission.percent" },
                        { percent: formatPercent(val.commission.commission_rates.rate, true) },
                      )
                    }
                    right={
                      <View
                        style={style.flatten([
                          "width-16",
                          "height-16",
                          "items-center",
                          "justify-center",
                        ])}
                      >
                        <RightArrowIcon
                          height={10}
                          color={style.get("color-gray-10").color}
                        />
                      </View>
                    }
                  />
                  <CardDivider
                    style={style.flatten([
                      "margin-0",
                      "background-color-gray-60",
                    ])}
                  />
                  <View
                    style={style.flatten([
                      "background-color-card-background",
                      "margin-0",
                      "padding-16",
                      "flex-row",
                      "items-center",
                    ])}
                  >
                    <PropertyView
                      label={intl.formatMessage({
                        id: "staking.delegate.invested",
                      })}
                      value={formatCoin(amount)}
                    />
                    <PropertyView
                      label={intl.formatMessage({
                        id: "staking.delegate.profit",
                      })}
                      value={"+" + formatCoin(rewards)}
                      valueStyle={style.get("color-rewards-text")}
                    />
                  </View>
                </RectButton>
              );
            })}
          </CardBody>
        ) : (
          <DelegationsEmptyItem
            label={intl.formatMessage({ id: "staking.delegate.empty" })}
            containerStyle={style.flatten([
              "background-color-background",
              "margin-y-32",
            ])}
          />
        )}
      </Card>
    );
  }
);

export const DelegationsEmptyItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  label: string;
}> = observer(({ containerStyle, label }) => {
  const style = useStyle();
  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-bottom-0", "items-center"])}>
        <Image
          source={require("../../../assets/image/empty-order-list.png")}
          resizeMode="contain"
          style={style.flatten(["height-60"])}
        />
        <Text
          style={style.flatten([
            "text-center",
            "text-caption2",
            "color-gray-30",
            "margin-top-12",
          ])}
        >
          {label}
        </Text>
      </CardBody>
    </Card>
  );
});
