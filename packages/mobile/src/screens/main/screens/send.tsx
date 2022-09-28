import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native";
import { useStyle } from "../../../styles";
import { AddressInput, AmountInput } from "../components";

import { ChainStore, useStore } from "../../../stores";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { FeeType, IAmountConfig, useSendTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useIntl } from "react-intl";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { buildLeftColumn, buildRightColumn, IRow, ListRowView } from "../../../components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { formatCoin, TX_GAS_DEFAULT } from "../../../common/utils";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { AccountStore, CosmosAccount, CosmwasmAccount, SecretAccount } from "@keplr-wallet/stores";

export const SendTokenScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    transactionStore,
    userBalanceStore,
  } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

  const account = accountStore.getAccount(chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainId,
    account.bech32Address,
    EthereumEndpoint
  );

  useEffect(() => {
    if (route.params.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === route.params.currency
      );
      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route.params.currency, sendConfigs.amountConfig]);

  useEffect(() => {
    if (route.params.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route.params.recipient, sendConfigs.recipientConfig]);

  const { gasPrice, gasLimit, feeType } = simulateSendGasFee(
    chainStore,
    accountStore,
    sendConfigs.amountConfig,
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const sendConfigError =
    // sendConfigs.recipientConfig.error ??
    // sendConfigs.amountConfig.error ??
    // sendConfigs.memoConfig.error ??
    // sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  console.log("__DEBUG__ sendConfigError ==== ", sendConfigError);

  const txStateIsValid = sendConfigError == null;
  const style = useStyle();
  const intl = useIntl();

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({ text: intl.formatMessage({ id: "stake.delegate.available" }) }),
        buildRightColumn({ text: userBalanceStore.getBalanceString() }),
      ]
    },
    {
      type: "items",
      cols: [
        buildLeftColumn({ text: intl.formatMessage({ id: "component.amount.input.fee" }) }),
        buildRightColumn({ text: feeText }),
      ]
    },
  ];

  const onSendHandler = async () => {
    if (account.isReadyToSendTx && txStateIsValid) {
      const params = {
        token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
        amount: Number(sendConfigs.amountConfig.amount),
        fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
        gas: gasLimit,
        gas_price: gasPrice,
        receiver_address: sendConfigs.recipientConfig.recipient,
      };

      try {
        let dec = new Dec(sendConfigs.amountConfig.amount);
        dec = dec.mulTruncate(DecUtils.getTenExponentN(sendConfigs.amountConfig.sendCurrency.coinDecimals));
        const amount = new CoinPretty(
          sendConfigs.amountConfig.sendCurrency,
          dec
        );

        transactionStore.updateRawData({
          type: account.cosmos.msgOpts.send.native.type,
          value: {
            amount,
            fee: sendConfigs.feeConfig.fee,
            recipient: sendConfigs.recipientConfig.recipient,
          }
        });

        await account.sendToken(
          sendConfigs.amountConfig.amount,
          sendConfigs.amountConfig.sendCurrency,
          sendConfigs.recipientConfig.recipient,
          sendConfigs.memoConfig.memo,
          sendConfigs.feeConfig.toStdFee(),
          {
            preferNoSetFee: true,
            preferNoSetMemo: true,
          },
          {
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("astra_hub_transfer_token", {
                ...params,
                tx_hash: Buffer.from(txHash).toString("hex"),
                success: true,
              });
              transactionStore.updateTxHash(txHash);
            },
          }
        );
      } catch (e: any) {
        analyticsStore.logEvent("astra_hub_transfer_token", {
          ...params,
          success: false,
          error: e?.message,
        });
        if (e?.message === "Request rejected") {
          return;
        }
        console.log("__DEBUG_ sendErr: ", e);
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
        <View style={{ height: 24 }} />
        <AddressInput recipientConfig={sendConfigs.recipientConfig} />
        <View style={{ height: 24 }} />
        <AmountInput
          hideDenom
          labelText={intl.formatMessage({ id: "component.amount.input.sendindAmount" })}
          errorText={sendConfigError?.message}
          amountConfig={sendConfigs.amountConfig}
          availableAmount={userBalanceStore.getBalance()}
          fee={sendConfigs.feeConfig.fee}
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
            text={intl.formatMessage({ id: "wallet.send.continue" })}
            disabled={!account.isReadyToSendTx || !txStateIsValid}
            loading={account.txTypeInProgress === "send"}
            onPress={onSendHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});

const simulateSendGasFee = (
  chainStore: ChainStore,
  accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount]
  >,
  amountConfig: IAmountConfig
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const chainId = chainStore.current.chainId;
  const [gasLimit, setGasLimit] = useState(TX_GAS_DEFAULT.send);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0"
    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals));
      return dec.truncate().toString();
    })();

    const msg = {
      type: account.cosmos.msgOpts.send.native.type,
      value: {
        from_address: account.bech32Address,
        to_address: account.bech32Address,
        amount: [
          {
            denom: amountConfig.sendCurrency.coinMinimalDenom,
            amount: actualAmount,
          },
        ],
      },
    };
    try {
      const { gasUsed } = await account.cosmos.simulateTx(
        [{
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: MsgSend.encode({
            fromAddress: msg.value.from_address,
            toAddress: msg.value.to_address,
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
      console.log("simulateSendGasFee error", e);
      setGasLimit(TX_GAS_DEFAULT.send); // default gas
    }
  }

  const feeType = "average" as FeeType;
  var gasPrice = 1000000000; // default 1 gwei = 1 nano aastra
  const feeConfig = chainStore.current.feeCurrencies.filter((feeCurrency) => {
    return feeCurrency.coinMinimalDenom === amountConfig.sendCurrency.coinMinimalDenom;
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