import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { Text, View, ViewStyle, Image } from "react-native";
import { useStyle } from "../../../styles";
import { Staking } from "@keplr-wallet/stores";
import { RightArrowIcon } from "../../../components/icon";
import { useSmartNavigation } from "../../../navigation";
import { RectButton } from "../../../components/rect-button";
import { Dec, IntPretty } from "@keplr-wallet/unit";
import { PropertyView } from "../component/property";
import { ValidatorItem } from "../../../components/input";

export const DelegationsItem: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const staked = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  ).total;

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

  const smartNavigation = useSmartNavigation();

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-bottom-0"])}>
        <Text style={style.flatten(["h5", "color-white", "margin-bottom-0"])}>
          Quỹ đầu tư của tôi
        </Text>
      </CardBody>

      {delegations && delegations.length > 0 ? (
        <CardBody style={style.flatten(["padding-x-0", "padding-y-14"])}>
          {delegations.map((del) => {
            const val = validatorsMap.get(del.delegation.validator_address);
            if (!val) {
              return null;
            }

            const thumbnail =
              bondedValidators.getValidatorThumbnail(val.operator_address) ||
              unbondingValidators.getValidatorThumbnail(val.operator_address) ||
              unbondedValidators.getValidatorThumbnail(val.operator_address);

            const amount = queryDelegations.getDelegationTo(
              val.operator_address
            );
            const total = priceStore.calculatePrice(amount);

            const rewards = queryRewards.getStakableRewardOf(
              val.operator_address
            );

            const totalRewards = priceStore.calculatePrice(rewards);

            return (
              <RectButton
                key={del.delegation.validator_address}
                style={style.flatten([
                  "flex",
                  "margin-x-16",
                  "margin-y-8",
                  "height-148",
                  "border-radius-16",
                  "border-width-1",
                  "border-color-gray-60",
                ])}
                onPress={() => {
                  smartNavigation.navigateSmart("Validator.Details.New", {
                    validatorAddress: del.delegation.validator_address,
                  });
                }}
              >
                <ValidatorItem
                  containerStyle={style.flatten([
                    "border-width-0",
                    "border-radius-0",
                  ])}
                  thumbnail={thumbnail}
                  name={val.description.moniker}
                  value={
                    new IntPretty(new Dec(val.commission.commission_rates.rate))
                      .moveDecimalPointRight(2)
                      .maxDecimals(2)
                      .trim(true)
                      .toString() + "%"
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
                    "margin-0",
                    "padding-16",
                    "flex-row",
                    "items-center",
                  ])}
                >
                  <PropertyView
                    label="Đã đầu tư"
                    value={amount
                      .maxDecimals(6)
                      .trim(true)
                      .shrink(true)
                      .toString()}
                    subValue={`~ ${
                      total
                        ? total.toString()
                        : amount.shrink(true).maxDecimals(6).toString()
                    }`}
                  />
                  <PropertyView
                    label="Tiền lãi"
                    value={rewards
                      .maxDecimals(6)
                      .trim(true)
                      .shrink(true)
                      .toString()}
                    subValue={`~ ${
                      totalRewards
                        ? totalRewards.toString()
                        : rewards.shrink(true).maxDecimals(6).toString()
                    }`}
                    valueStyle={style.get("color-green-50")}
                  />
                </View>
              </RectButton>
            );
          })}
        </CardBody>
      ) : ( 
        <DelegationsEmptyItem
          label="Bạn chưa có quỹ đầu tư nào"
          containerStyle={style.flatten([
            "background-color-background",
            "margin-y-32",
          ])}
        />
      )}
    </Card>
  );
});

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
        ></Image>
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
