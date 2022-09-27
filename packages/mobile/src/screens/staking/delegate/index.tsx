import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../../styles";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import { ChainStore, useStore } from "../../../stores";
import { FeeType, IAmountConfig, useDelegateTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { AmountInput } from "../../main/components";
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
import { formatCoin, formatPercent, formatUnbondingTime, TX_GAS_DEFAULT } from "../../../common/utils";
import { MsgDelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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
    sendConfigs.gasConfig.error;
  const txStateIsValid = sendConfigError == null;
  console.log("__DEBUG__ sendConfigError === ", sendConfigError);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const validator = bondedValidators.getValidator(validatorAddress);

  const balanceText = userBalanceStore.getBalanceString();

  const name = validator?.description.moniker ?? "";
  const thumbnailUrl = bondedValidators.getValidatorThumbnail(validatorAddress);

  const commissionText = intl.formatMessage(
    { id: "validator.details.commission.percent" },
    { percent: formatPercent(validator?.commission.commission_rates.rate, true) },
  );

  const votingPower = new CoinPretty(
    chainStore.current.stakeCurrency,
    new Dec(validator?.tokens || 0)
  )
    .maxDecimals(0)
    .toString();

  const { gasPrice, gasLimit, feeType } = simulateDelegateGasFee(
    chainStore,
    accountStore,
    sendConfigs.amountConfig,
    validatorAddress,
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const unbondingTime = queries.cosmos.queryStakingParams.unbondingTimeSec ?? 172800;
  const unbondingTimeText = formatUnbondingTime(unbondingTime, intl);

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "stake.delegate.available" }),
        }),
        buildRightColumn({ text: balanceText }),
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

  const onContinueHandler = async () => {
    if (account.isReadyToSendTx && txStateIsValid) {
      const params = {
        token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
        amount: Number(sendConfigs.amountConfig.amount),
        fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
        gas: gasLimit,
        gas_price: gasPrice,
        validator_address: validatorAddress,
        validator_name: validator?.description.moniker,
        commission: Number(formatPercent(validator?.commission.commission_rates.rate, true)),
      };

      try {
        let dec = new Dec(sendConfigs.amountConfig.amount);
        dec = dec.mulTruncate(DecUtils.getTenExponentN(sendConfigs.amountConfig.sendCurrency.coinDecimals));
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
                ...params,
                tx_hash: Buffer.from(txHash).toString("hex"),
                success: true,
              });
              transactionStore.updateTxHash(txHash);
            },
          }
        );
      } catch (e: any) {
        analyticsStore.logEvent("astra_hub_delegate_token", {
          ...params,
          success: false,
          error: e?.message,
        });
        if (e?.message === "Request rejected") {
          return;
        }
        console.log(e);
        transactionStore.updateTxState("failure");
      }
    }
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten(["padding-x-page"])}
        enableOnAndroid
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
          {...{ name, thumbnailUrl, commission: commissionText, votingPower }}
        />
        <AmountInput
          labelText={intl.formatMessage({ id: "stake.delegate.amount" })}
          amountConfig={sendConfigs.amountConfig}
          availableAmount={userBalanceStore.getBalance()}
          fee={sendConfigs.feeConfig.fee}
          containerStyle={style.flatten(["margin-top-24"])}
        />
        <ListRowView
          rows={rows}
          style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 16 }}
          hideBorder
          clearBackground
        />
      </KeyboardAwareScrollView>
      <View style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}>
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
        <View style={{ ...style.flatten(["background-color-background"]), height: 56 }}>
          <Button
            text={intl.formatMessage({ id: "stake.delegate.invest" })}
            disabled={!account.isReadyToSendTx || !txStateIsValid}
            loading={account.txTypeInProgress === "delegate"}
            onPress={onContinueHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});

const simulateDelegateGasFee = (
  chainStore: ChainStore,
  accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount]
  >,
  amountConfig: IAmountConfig,
  validatorAddress: string,
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const chainId = chainStore.current.chainId;
  const [gasLimit, setGasLimit] = useState(TX_GAS_DEFAULT.delegate);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0"
    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals));

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

    try {
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
    catch (e) {
      console.log("simulateDelegateGasFee error", e);
      setGasLimit(TX_GAS_DEFAULT.delegate); // default gas
    }
  }

  const feeType = "average" as FeeType;
  var gasPrice = 1000000000; // default 1 gwei = 1 nano aastra
  const feeConfig = chainStore.current.feeCurrencies.filter((feeCurrency) => {
    return feeCurrency.coinMinimalDenom === chainStore.current.stakeCurrency.coinMinimalDenom;
  }).shift();
  if (feeConfig?.gasPriceStep) {
    const { [feeType]: wei } = feeConfig.gasPriceStep;
    gasPrice = wei;
  }

  return {
    gasPrice,
    gasLimit,
    feeType,
  }
};