import React, { FunctionComponent } from "react";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { RewardDetails } from "./rewards";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";
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
  sendConfigs.feeConfig.setFeeType("average");
  sendConfigs.gasConfig.setGas(700000);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const withdrawAllRewards = async () => {
    try {
      transactionStore.updateTxData({
        chainInfo: chainStore.current,
      });

      const tx = account.cosmos.makeWithdrawDelegationRewardTx(
        validatorAddresses
      );
      await tx.simulateAndSend(
        { gasAdjustment: 1.5 },
        sendConfigs.memoConfig.memo,
        {
          preferNoSetMemo: true,
          preferNoSetFee: true,
        },
        {
          onBroadcasted: (txHash) => {
            analyticsStore.logEvent("astra_hub_claim_reward", {
              tx_hash: Buffer.from(txHash).toString("hex"),
              token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
              amount: Number(sendConfigs.amountConfig.amount),
              fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
              fee_type: sendConfigs.feeConfig.feeType,
              gas: sendConfigs.gasConfig.gas,
              validator_addresses: JSON.stringify(validatorAddresses),
              success: true,
            });
            transactionStore.updateTxHash(txHash);
          },
        }
      );
    } catch (e: any) {
      analyticsStore.logEvent("astra_hub_claim_reward", {
        token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
        amount: Number(sendConfigs.amountConfig.amount),
        fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
        fee_type: sendConfigs.feeConfig.feeType,
        gas: sendConfigs.gasConfig.gas,
        validator_addresses: JSON.stringify(validatorAddresses),
        success: false,
        error: e?.message,
      });
      if (e?.message === "Request rejected") {
        return;
      }
      transactionStore.rejectTransaction();
      console.log("got e", e);
      smartNavigation.navigateSmart("NewHome", {});
    }
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <ScrollView style={style.flatten(["flex-1"])}>
        <View style={style.flatten(["height-24"])} />
        <Text style={style.flatten(["color-gray-30", "text-base-regular", "text-center"])}>
          {intl.formatMessage({ id: "staking.rewards.totalProfit" })}
        </Text>
        <Text
          style={style.flatten([
            "color-gray-10",
            "text-4x-large-semi-bold",
            "text-center",
            "margin-top-4",
            "margin-bottom-24",
          ])}
        >
          {formatCoin(stakingReward)}
        </Text>
        <RewardDetails
          feeText={feeText}
          containerStyle={style.flatten(["background-color-background"])}
        />
      </ScrollView>
      <View style={style.flatten(["height-1", "background-color-gray-70"])} />
      <Button
        containerStyle={style.flatten([
          "margin-y-12",
          "margin-x-page"
        ])}
        text={intl.formatMessage({ id: "staking.rewards.withdrawRewards" })}
        onPress={withdrawAllRewards}
        loading={account.txTypeInProgress === "withdrawRewards"}
      />
      <SafeAreaView />
    </View>
  );
};
