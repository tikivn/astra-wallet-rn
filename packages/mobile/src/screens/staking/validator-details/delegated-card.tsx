import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Image, Text, View, ViewStyle } from "react-native";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { RectButton } from "../../../components/rect-button";
import { FormattedMessage } from "react-intl";

export const DelegatedCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const smartNavigation = useSmartNavigation();

  const style = useStyle();

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const totalStaked = priceStore.calculatePrice(staked);

  const rewards = queries.cosmos.queryRewards
    .getQueryBech32Address(account.bech32Address)
    .getStakableRewardOf(validatorAddress);
  const totalRewards = priceStore.calculatePrice(rewards);
  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-y-0"])}>
        <View
          style={style.flatten([
            "height-208",
            "padding-0",
            "border-radius-16",
            "border-color-gray-60",
            "border-width-1",
          ])}
        >
          <View
            style={style.flatten([
              "height-90",
              "margin-x-16",
              "margin-y-0",
              "flex-row",
              "justify-center",
            ])}
          >
            <View
              style={style.flatten([
                "flex-1",
                "margin-left-0",
                "items-center",
                "padding-16",
              ])}
            >
              <Text
                style={style.flatten([
                  "color-gray-30",
                  "subtitle4",
                  "margin-top-0",
                ])}
              >
                <FormattedMessage id="validator.details.delegated.invested" />
              </Text>
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "subtitle2",
                  "margin-y-2",
                ])}
              >
                {staked.trim(true).shrink(true).maxDecimals(6).toString()}
              </Text>
              <Text
                style={style.flatten([
                  "color-gray-30",
                  "subtitle4",
                  "margin-bottom-0",
                ])}
              >
                ~{" "}
                {totalStaked
                  ? totalStaked.toString()
                  : staked.shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
            <View
              style={style.flatten([
                "background-color-gray-70",
                "margin-y-0",
                "width-1",
              ])}
            />
            <View
              style={style.flatten([
                "flex-1",
                "margin-left-0",
                "items-center",
                "padding-16",
              ])}
            >
              <Text
                style={style.flatten([
                  "color-gray-30",
                  "subtitle4",
                  "margin-top-0",
                ])}
              >
                <FormattedMessage id="validator.details.delegated.profit" />
              </Text>
              <Text
                style={style.flatten([
                  "color-green-50",
                  "subtitle2",
                  "margin-y-2",
                ])}
              >
                {rewards.trim(true).shrink(true).maxDecimals(6).toString()}
              </Text>
              <Text
                style={style.flatten([
                  "color-gray-30",
                  "subtitle4",
                  "margin-bottom-0",
                ])}
              >
                ~{" "}
                {totalRewards
                  ? totalRewards.toString()
                  : rewards.shrink(true).maxDecimals(6).toString()}
              </Text>
            </View>
          </View>
          <CardDivider
            style={style.flatten(["background-color-gray-70", "margin-x-0"])}
          />
          <View
            style={style.flatten([
              "margin-y-12",
              "flex-row",
              "justify-between",
              "padding-16",
            ])}
          >
            <RectButton
              style={style.flatten(["items-center", "width-80"])}
              onPress={() => {
                smartNavigation.navigateSmart("Undelegate", {
                  validatorAddress,
                });
              }}
            >
              <Image
                style={style.flatten(["width-44", "height-44"])}
                source={require("../../../assets/image/icon_withdraw.png")}
                resizeMode="contain"
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "margin-y-4",
                  "text-caption2",
                  "text-center",
                ])}
              >
                <FormattedMessage id="validator.details.delegated.undelegate" />
              </Text>
            </RectButton>

            <RectButton
              style={style.flatten(["items-center", "width-80"])}
              onPress={() => {
                smartNavigation.navigateSmart("Redelegate", {
                  validatorAddress,
                });
              }}
            >
              <Image
                style={style.flatten(["width-44", "height-44"])}
                source={require("../../../assets/image/icon_swap.png")}
                resizeMode="contain"
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "margin-y-4",
                  "text-caption2",
                  "text-center",
                ])}
              >
                <FormattedMessage id="validator.details.delegated.regelegate" />
              </Text>
            </RectButton>

            <RectButton
              style={style.flatten(["items-center", "width-80"])}
              onPress={() => {
                smartNavigation.navigateSmart("Delegate", {
                  validatorAddress,
                });
              }}
            >
              <Image
                style={style.flatten(["width-44", "height-44"])}
                source={require("../../../assets/image/icon_add.png")}
                resizeMode="contain"
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "margin-y-4",
                  "text-caption2",
                  "text-center",
                ])}
              >
                <FormattedMessage id="validator.details.delegated.investMore" />
              </Text>
            </RectButton>
          </View>
        </View>
      </CardBody>
    </Card>
  );
});
