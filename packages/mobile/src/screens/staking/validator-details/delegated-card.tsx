import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Text, View, ViewStyle } from "react-native";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";
import { registerModal } from "../../../modals/base";
import {
  Button,
  CannotRedelegateIcon,
  DelegateIcon,
  RedelegateIcon,
  UndelegateIcon,
} from "../../../components";

export const DelegatedCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const smartNavigation = useSmartNavigation();

  const style = useStyle();
  const intl = useIntl();

  const [
    displayCannotRedelegateModal,
    setDisplayCannotRedelegateModal,
  ] = useState(false);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const rewards = queries.cosmos.queryRewards
    .getQueryBech32Address(account.bech32Address)
    .getStakableRewardOf(validatorAddress);

  const redelegation = queries.cosmos.queryRedelegations
    .getQueryBech32Address(account.bech32Address)
    .getRedelegations({ dstValidatorAddress: validatorAddress })
    .shift();

  const redelegationCompletionTime = useMemo(() => {
    const completionTime = redelegation?.entries.shift()?.redelegation_entry
      .completion_time;
    return (completionTime
      ? new Date(completionTime)
      : new Date()
    ).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [redelegation]);

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-y-0"])}>
        <View
          style={style.flatten([
            "padding-0",
            "background-color-card-background",
            "border-radius-16",
            "border-color-card-border",
            "border-width-1",
          ])}
        >
          <View
            style={style.flatten(["margin-y-0", "flex-row", "justify-center"])}
          >
            <View
              style={style.flatten([
                "flex-1",
                "margin-left-0",
                "items-center",
                "padding-x-16",
                "padding-y-24",
              ])}
            >
              <Text
                style={style.flatten(["color-gray-30", "text-small-medium"])}
              >
                <FormattedMessage id="validator.details.delegated.invested" />
              </Text>
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "text-medium-medium",
                  "margin-top-2",
                ])}
              >
                {formatCoin(staked)}
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
                "padding-x-16",
                "padding-y-24",
              ])}
            >
              <Text
                style={style.flatten(["color-gray-30", "text-small-medium"])}
              >
                <FormattedMessage id="validator.details.delegated.profit" />
              </Text>
              <Text
                style={style.flatten([
                  "color-rewards-text",
                  "text-medium-medium",
                  "margin-top-2",
                ])}
              >
                {"+" + formatCoin(rewards)}
              </Text>
            </View>
          </View>
          <CardDivider
            style={style.flatten(["background-color-gray-70", "margin-x-0"])}
          />
          <View style={style.flatten(["margin-y-16", "flex-row"])}>
            <View
              style={style.flatten(["items-center", "flex-1", "padding-x-16"])}
            >
              <Button
                color="neutral"
                text=""
                leftIcon={<UndelegateIcon />}
                onPress={() => {
                  smartNavigation.navigateSmart("Undelegate", {
                    validatorAddress,
                  });
                }}
                containerStyle={style.flatten([
                  "border-radius-22",
                  "width-44",
                  "padding-x-0",
                ])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "margin-top-8",
                  "text-caption2",
                  "text-center",
                ])}
              >
                <FormattedMessage id="validator.details.delegated.undelegate" />
              </Text>
            </View>
            <View
              style={style.flatten(["items-center", "flex-1", "padding-x-16"])}
            >
              <Button
                color="neutral"
                text=""
                leftIcon={<RedelegateIcon />}
                onPress={() => {
                  if (!redelegation) {
                    smartNavigation.navigateSmart("Redelegate", {
                      validatorAddress,
                    });
                    return;
                  }

                  setDisplayCannotRedelegateModal(true);
                }}
                containerStyle={style.flatten([
                  "border-radius-22",
                  "width-44",
                  "padding-x-0",
                ])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "margin-top-8",
                  "text-caption2",
                  "text-center",
                ])}
              >
                <FormattedMessage id="validator.details.delegated.regelegate" />
              </Text>
              <CannotRedelegateModal
                isOpen={displayCannotRedelegateModal}
                close={() => {
                  setDisplayCannotRedelegateModal(false);
                }}
                title={intl.formatMessage({
                  id: "common.modal.cannotRedelegate.title",
                })}
                content={intl.formatMessage(
                  { id: "common.modal.cannotRedelegate.content" },
                  { date: redelegationCompletionTime }
                )}
                buttonText={intl.formatMessage({
                  id: "common.text.understand",
                })}
              />
            </View>
            <View
              style={style.flatten(["items-center", "flex-1", "padding-x-16"])}
            >
              <Button
                text=""
                leftIcon={<DelegateIcon />}
                onPress={() => {
                  smartNavigation.navigateSmart("Delegate", {
                    validatorAddress,
                  });
                }}
                containerStyle={style.flatten([
                  "border-radius-22",
                  "width-44",
                  "padding-x-0",
                ])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "margin-top-8",
                  "text-caption2",
                  "text-center",
                ])}
              >
                <FormattedMessage id="validator.details.delegated.investMore" />
              </Text>
            </View>
          </View>
        </View>
      </CardBody>
    </Card>
  );
});

const CannotRedelegateModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  content: string;
  buttonText: string;
}> = registerModal(({ close, title, content, buttonText }) => {
  const style = useStyle();

  return (
    <View style={style.flatten(["height-full", "justify-center"])}>
      <View
        style={style.flatten([
          "items-center",
          "content-stretch",
          "margin-x-40",
          "padding-16",
          "border-radius-8",
          "border-width-1",
          "border-color-gray-60",
          "background-color-gray-90",
        ])}
      >
        <CannotRedelegateIcon />
        <Text
          style={style.flatten([
            "text-medium-semi-bold",
            "color-gray-10",
            "margin-top-16",
            "text-center",
          ])}
        >
          {title}
        </Text>
        <Text
          style={style.flatten([
            "text-base-regular",
            "color-gray-30",
            "margin-top-8",
            "text-center",
          ])}
        >
          {content}
        </Text>
        <View style={style.flatten(["width-full", "content-stretch"])}>
          <Button
            text={buttonText}
            onPress={close}
            containerStyle={style.flatten(["margin-top-16"])}
          />
        </View>
      </View>
    </View>
  );
});
