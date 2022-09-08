import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";
import { FeeType, IAmountConfig, useUndelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "../../../components/page";
import { AmountInput, ValidatorItem } from "../../../components/input";
import { View } from "react-native";
import { Button } from "../../../components/button";
import { AccountStore, CosmosAccount, CosmwasmAccount, SecretAccount, Staking } from "@keplr-wallet/stores";
import { useSmartNavigation } from "../../../navigation-util";
import { AlertInline } from "../../../components/alert-inline";
import {
  AlignItems,
  ItemRow,
} from "../../../components/foundation-view/item-row";
import { TextAlign } from "../../../components/foundation-view/text-style";
import { useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";
import { MsgUndelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { CoinPretty, Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";

export const UndelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;

  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    transactionStore,
  } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const validator =
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const validatorThumbnail = validator
    ? queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidatorThumbnail(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidatorThumbnail(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidatorThumbnail(validatorAddress)
    : undefined;

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    validatorAddress
  );

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;

  const { gasLimit, feeType } = simulateUndelegateGasFee(
    chainStore.current.chainId,
    accountStore,
    sendConfigs.amountConfig,
    validatorAddress,
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const chainInfo = chainStore.getChain(chainStore.current.chainId).raw;
  const unbondingTime = chainInfo.unbondingTime ?? 86400000;
  const unbondingTimeText = (() => {
    const relativeEndTime = unbondingTime / 1000;
    const relativeEndTimeDays = Math.floor(relativeEndTime / (3600 * 24));
    const relativeEndTimeHours = Math.ceil(relativeEndTime / 3600);

    if (relativeEndTimeDays) {
      return intl
        .formatRelativeTime(relativeEndTimeDays, "days", {
          numeric: "always",
        })
        .replace("days", intl.formatMessage({ id: "staking.unbonding.days" }));
    } else if (relativeEndTimeHours) {
      return intl
        .formatRelativeTime(relativeEndTimeHours, "hours", {
          numeric: "always",
        })
        .replace("hours", "h");
    }

    return "";
  })();
  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <AlertInline
        type="warning"
        content={intl.formatMessage(
          { id: "stake.undelegate.noticeWithdrawalPeriod" },
          { coin: "ASA", days: unbondingTimeText }
        )}
      />
      <ValidatorItem
        containerStyle={style.flatten(["margin-y-16"])}
        name={validator ? validator.description.moniker : "..."}
        thumbnail={validatorThumbnail}
        value={formatCoin(staked)}
      />
      <AmountInput
        label={intl.formatMessage({ id: "stake.undelegate.amountLabel" })}
        amountConfig={sendConfigs.amountConfig}
      />
      <ItemRow
        style={{ marginHorizontal: 0, paddingHorizontal: 0 }}
        alignItems={AlignItems.center}
        itemSpacing={12}
        columns={[
          {
            text: intl.formatMessage({ id: "stake.undelegate.available" }),
            textColor: Colors["gray-30"],
          },
          {
            text: formatCoin(staked),
            textColor: Colors["gray-10"],
            textAlign: TextAlign.right,
            flex: 1,
          },
        ]}
      />
      <ItemRow
        style={{ marginHorizontal: 0, paddingHorizontal: 0 }}
        alignItems={AlignItems.center}
        itemSpacing={12}
        columns={[
          {
            text: intl.formatMessage({ id: "stake.undelegate.fee" }),
            textColor: Colors["gray-30"],
          },
          {
            text: feeText,
            textColor: Colors["gray-10"],
            textAlign: TextAlign.right,
            flex: 1,
          },
        ]}
      />
      {/* <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      /> */}
      <View style={style.flatten(["flex-1"])} />
      <Button
        containerStyle={style.flatten(["border-radius-4", "height-44"])}
        textStyle={style.flatten(["subtitle2"])}
        text={intl.formatMessage({ id: "stake.undelegate.undelegate" })}
        size="large"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "undelegate"}
        onPress={async () => {
          if (account.isReadyToSendTx && txStateIsValid) {
            try {
              let dec = new Dec(sendConfigs.amountConfig.amount);
              dec = dec.mulTruncate(DecUtils.getPrecisionDec(sendConfigs.amountConfig.sendCurrency.coinDecimals));
              const amount = new CoinPretty(
                sendConfigs.amountConfig.sendCurrency,
                dec
              );

              transactionStore.updateRawData({
                type: account.cosmos.msgOpts.undelegate.type,
                value: {
                  amount,
                  fee: sendConfigs.feeConfig.fee,
                  validatorAddress,
                  validatorName: validator?.description.moniker,
                  commission: new IntPretty(new Dec(validator?.commission.commission_rates.rate ?? 0)),
                },
              });
              const tx = account.cosmos.makeUndelegateTx(
                sendConfigs.amountConfig.amount,
                sendConfigs.recipientConfig.recipient
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
                    analyticsStore.logEvent("astra_hub_undelegate_token", {
                      tx_hash: Buffer.from(txHash).toString("hex"),
                      token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
                      amount: Number(sendConfigs.amountConfig.amount),
                      fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
                      fee_type: feeType,
                      gas: gasLimit,
                      validator_address: validatorAddress,
                      validator_name: validator?.description.moniker,
                      commission: 100 * Number(validator?.commission.commission_rates.rate ?? "0"),
                      success: true,
                    });
                    transactionStore.updateTxHash(txHash);
                  },
                }
              );
            } catch (e: any) {
              analyticsStore.logEvent("astra_hub_undelegate_token", {
                token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
                amount: Number(sendConfigs.amountConfig.amount),
                fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
                fee_type: feeType,
                gas: gasLimit,
                validator_address: validatorAddress,
                validator_name: validator?.description.moniker,
                commission: 100 * Number(validator?.commission.commission_rates.rate ?? "0"),
                success: false,
                error: e?.message,
              });
              if (e?.message === "Request rejected") {
                return;
              }
              transactionStore.rejectTransaction();
              console.log(e);
              smartNavigation.navigateSmart("NewHome", {});
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});

const simulateUndelegateGasFee = (
  chainId: string,
  accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount]
  >,
  amountConfig: IAmountConfig,
  validatorAddress: string,
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const [gasLimit, setGasLimit] = useState(0);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0"
    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(amountConfig.sendCurrency.coinDecimals));

    const msg = {
      type: account.cosmos.msgOpts.undelegate.type,
      value: {
        delegator_address: account.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: amountConfig.sendCurrency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };
    const { gasUsed } = await account.cosmos.simulateTx(
      [{
        typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
        value: MsgUndelegate.encode({
          delegatorAddress: msg.value.delegator_address,
          validatorAddress: msg.value.validator_address,
          amount: msg.value.amount,
        }).finish(),
      }],
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