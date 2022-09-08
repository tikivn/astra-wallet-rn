import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../../components/page";
import { Colors, useStyle } from "../../../styles";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import { useStore } from "../../../stores";
import { FeeType, IAmountConfig, useDelegateTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { AmountInput } from "../../../components/input";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { AccountStore, CosmosAccount, CosmwasmAccount, SecretAccount, Staking } from "@keplr-wallet/stores";
import { ValidatorInfo } from "./components/validator-info";
import {
  buildLeftColumn,
  buildRightColumn,
} from "../../../components/foundation-view/item-row";
import { CoinPretty, Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import {
  IRow,
  ListRowView,
} from "../../../components/foundation-view/list-row-view";
import { AlertInline } from "../../../components";
import { useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";
import { MsgDelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";

export const DelegateScreen: FunctionComponent = observer(() => {
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
    userBalanceStore,
    transactionStore,
  } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    EthereumEndpoint
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

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const validator = bondedValidators.getValidator(validatorAddress);
  // console.log("__DEBUG__ validator:", JSON.stringify(validator));

  const balance = userBalanceStore.getBalanceString();

  const name = validator?.description.moniker ?? "";
  const thumbnailUrl = bondedValidators.getValidatorThumbnail(validatorAddress);

  const commission =
    new IntPretty(new Dec(validator?.commission.commission_rates.rate || 0))
      .moveDecimalPointRight(2)
      .maxDecimals(2)
      .trim(true)
      .toString() + "%";

  const votingPower = new CoinPretty(
    chainStore.current.stakeCurrency,
    new Dec(validator?.tokens || 0)
  )
    .maxDecimals(0)
    .toString();

  const { gasLimit, feeType } = simulateDelegateGasFee(
    chainStore.current.chainId,
    accountStore,
    sendConfigs.amountConfig,
    validatorAddress,
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "stake.delegate.available" }),
        }),
        buildRightColumn({ text: balance }),
      ],
    },
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "stake.delegate.fee" }),
        }),
        buildRightColumn({ text: feeText }),
      ],
    },
  ];

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
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
      backgroundColor={Colors["gray-100"]}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <AlertInline
        type="warning"
        content={intl.formatMessage(
          { id: "stake.delegate.warning" },
          { days: unbondingTimeText }
        )}
      />
      <ValidatorInfo
        style={{ marginTop: 24 }}
        {...{ name, thumbnailUrl, commission, votingPower }}
      />
      <AmountInput
        containerStyle={{ marginTop: 24 }}
        label={intl.formatMessage({ id: "stake.delegate.amount" })}
        amountConfig={sendConfigs.amountConfig}
      />
      <ListRowView
        rows={rows}
        style={{ paddingHorizontal: 0 }}
        hideBorder
        clearBackground
      />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text={intl.formatMessage({ id: "stake.delegate.invest" })}
        size="large"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "delegate"}
        onPress={async () => {
          if (account.isReadyToSendTx && txStateIsValid) {
            try {
              let dec = new Dec(sendConfigs.amountConfig.amount);
              dec = dec.mulTruncate(DecUtils.getPrecisionDec(sendConfigs.amountConfig.sendCurrency.coinDecimals));
              const amount = new CoinPretty(
                sendConfigs.amountConfig.sendCurrency,
                dec,
              );
          
              transactionStore.updateRawData({
                type: account.cosmos.msgOpts.delegate.type,
                value: {
                  amount,
                  fee: sendConfigs.feeConfig.fee,
                  validatorAddress,
                  validatorName: validator?.description.moniker,
                  commission: new IntPretty(new Dec(validator?.commission.commission_rates.rate ?? 0)),
                },
              });
              const tx = account.cosmos.makeDelegateTx(
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
                    analyticsStore.logEvent("astra_hub_delegate_token", {
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
              analyticsStore.logEvent("astra_hub_delegate_token", {
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

const simulateDelegateGasFee = (
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
      type: account.cosmos.msgOpts.delegate.type,
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
        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
        value: MsgDelegate.encode({
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