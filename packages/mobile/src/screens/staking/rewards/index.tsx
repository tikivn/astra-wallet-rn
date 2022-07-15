import React, { FunctionComponent, useMemo } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { View, Text } from "react-native";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { RewardDetails } from "./rewards";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { FormattedMessage, useIntl } from "react-intl";
export const StakingRewardScreen: FunctionComponent = () => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    transactionStore,
  } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const stakingReward = queryReward.stakableReward;
  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    EthereumEndpoint
  );
  const validatorAddresses = queryReward.getDescendingPendingRewardValidatorAddresses(
    8
  );
  const gas = Math.max(100000 * validatorAddresses.length, 200000);
  sendConfigs.gasConfig.setGas(gas);

  const withdrawAllRewards = async () => {
    try {
      transactionStore.updateTxData({
        chainInfo: chainStore.current,
      });
      await account.cosmos.sendWithdrawDelegationRewardMsgs(
        validatorAddresses,
        "",
        sendConfigs.feeConfig.toStdFee(),
        {},
        {
          onBroadcasted: (txHash) => {
            analyticsStore.logEvent("Claim reward tx broadcasted", {
              chainId: chainStore.current.chainId,
              chainName: chainStore.current.chainName,
            });
            transactionStore.updateTxHash(txHash);
          },
        }
      );
    } catch (e) {
      if (e?.message === "Request rejected") {
        return;
      }
      transactionStore.rejectTransaction();
      console.log("got e", e);
      smartNavigation.navigateSmart("NewHome", {});
    }
  };

  return (
    <PageWithScrollView backgroundColor={style.get("color-background").color}>
      <View style={style.flatten(["height-32"])} />
      <Text
        style={style.flatten(["color-gray-30", "subtitle3", "text-center"])}
      >
        <FormattedMessage id="staking.rewards.totalProfit" />
      </Text>
      <Text
        style={style.flatten([
          "color-gray-10",
          "title1",
          "text-center",
          "margin-top-8",
        ])}
      >
        {stakingReward
          .shrink(true)
          .maxDecimals(6)
          .trim(true)
          .upperCase(true)
          .toString()}
      </Text>
      <View style={style.flatten(["height-48"])} />
      <View style={style.flatten(["flex-1"])} />
      <RewardDetails
        containerStyle={style.flatten(["background-color-background"])}
      />
      <Button
        containerStyle={style.flatten([
          "border-radius-4",
          "height-44",
          "margin-16",
        ])}
        textStyle={style.flatten(["subtitle2"])}
        text={intl.formatMessage({ id: "staking.rewards.withdrawRewards" })}
        size="large"
        onPress={withdrawAllRewards}
        loading={account.txTypeInProgress === "withdrawRewards"}
      />
      {/* Mock element for bottom padding */}
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
};
