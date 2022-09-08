import React, { FunctionComponent, useEffect, useState } from "react";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { RewardDetails } from "./rewards";
import { FeeType, useSendTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";
import { MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import { AccountStore, CosmosAccount, CosmwasmAccount, SecretAccount } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";

export type StakableRewards = {
  delegatorAddress?: string,
  validatorAddress?: string,
  validatorName?: string,
  rewards?: CoinPretty,
};

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
  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    EthereumEndpoint
  );

  const stakableRewardsList = transactionStore.getDelegations({
    chainId: chainStore.current.chainId,
    delegatorAddress: account.bech32Address,
  })?.map((delegation) => {
    const validator = transactionStore.getValidator({
      chainId: chainStore.current.chainId,
      validatorAddress: delegation.delegation.validator_address,
    });
    const rewards = queryReward.getStakableRewardOf(delegation.delegation.validator_address);

    return {
      delegatorAddress: account.bech32Address,
      validatorAddress: validator?.operator_address,
      validatorName: validator?.description.moniker,
      rewards,
    }
  }).filter((stakableRewards) => {
    const { rewards } = stakableRewards;
    return rewards.toDec().gte(new Dec(0.001));
  }).sort((a, b) => {
    // Sort DESC
    return Number(b.rewards.toDec()) - Number(a.rewards.toDec());
  });

  const stakingReward = stakableRewardsList
    ? stakableRewardsList?.map(({ rewards }) => rewards).reduce((oldRewards, newRewards) => {
      return oldRewards.add(newRewards);
    })
    : undefined;

  const validatorAddresses = stakableRewardsList?.map((info) => info.validatorAddress) as string[];

  const { gasLimit, feeType } = simulateWithdrawRewardGasFee(
    chainStore.current.chainId,
    accountStore,
    validatorAddresses,
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const withdrawAllRewards = async () => {
    try {
      transactionStore.updateRawData({
        type: account.cosmos.msgOpts.withdrawRewards.type,
        value: {
          totalRewards: stakingReward,
          fee: sendConfigs.feeConfig.fee,
          validatorRewards: stakableRewardsList?.map(({ validatorAddress, validatorName, rewards }) => {
            return {
              validatorAddress,
              validatorName,
              rewards,
            };
          }) ?? [],
        },
      });

      const tx = account.cosmos.makeWithdrawDelegationRewardTx(
        validatorAddresses
      );
      await tx.simulateAndSend(
        { gasAdjustment: 1.3 },
        sendConfigs.memoConfig.memo,
        {
          preferNoSetMemo: true,
          preferNoSetFee: true,
        },
        {
          onBroadcasted: (txHash) => {
            analyticsStore.logEvent("astra_hub_claim_reward", {
              tx_hash: Buffer.from(txHash).toString("hex"),
              token: stakingReward?.denom,
              amount: Number(stakingReward?.toDec() || 0),
              fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
              fee_type: feeType,
              gas: gasLimit,
              validator_addresses: JSON.stringify(validatorAddresses),
              success: true,
            });
            transactionStore.updateTxHash(txHash);
          },
        }
      );
    } catch (e: any) {
      analyticsStore.logEvent("astra_hub_claim_reward", {
        token: stakingReward?.denom,
        amount: Number(stakingReward?.toDec() || 0),
        fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
        fee_type: feeType,
        gas: gasLimit,
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
          stakableRewardsList={stakableRewardsList}
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

const simulateWithdrawRewardGasFee = (
  chainId: string,
  accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount]
  >,
  validatorAddresses: string[],
) => {
  useEffect(() => {
    simulate();
  }, []);

  const [gasLimit, setGasLimit] = useState(0);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const msgs = validatorAddresses.map((validatorAddress) => {
      return {
        type: account.cosmos.msgOpts.withdrawRewards.type,
        value: {
          delegator_address: account.bech32Address,
          validator_address: validatorAddress,
        },
      };
    });
    const { gasUsed } = await account.cosmos.simulateTx(
      msgs.map((msg) => {
        return {
          typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
          value: MsgWithdrawDelegatorReward.encode({
            delegatorAddress: msg.value.delegator_address,
            validatorAddress: msg.value.validator_address,
          }).finish(),
        };
      }),
      { amount: [] },
    );

    const gasLimit = Math.ceil(gasUsed * 1.3);
    console.log("__DEBUG__ simulate gasUsed", gasUsed);
    console.log("__DEBUG__ simulate gasLimit", gasLimit);
    setGasLimit(gasLimit);
  }

  return {
    gasLimit,
    feeType: "average" as FeeType
  }
};