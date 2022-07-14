import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect } from "react";
import { View, Text } from "react-native";
import { PageWithScrollView } from "../../../components/page";
import { useStyle } from "../../../styles";
import { AddressInput, AmountInput } from "../components";

import { useStore } from "../../../stores";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useIntl } from "react-intl";

export const SendTokenScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    transactionStore,
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

  sendConfigs.gasConfig.setGas(200000);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16", "padding-x-16"])}
      backgroundColor={style.get("color-background").color}
    >
      <View style={style.get("height-12")} />
      <AddressInput
        recipientConfig={sendConfigs.recipientConfig}
        memoConfig={sendConfigs.memoConfig}
      />
      <View style={style.get("height-12")} />
      <AmountInput amountConfig={sendConfigs.amountConfig} />
      <View style={style.get("height-12")} />
      <Button
        text={intl.formatMessage({id: "wallet.send.continue"})}
        size="large"
        containerStyle={style.flatten(["border-radius-4"])}
        textStyle={style.flatten(["subtitle2"])}
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "send"}
        onPress={async () => {
          if (account.isReadyToSendTx && txStateIsValid) {
            try {
              transactionStore.updateTxData({
                chainInfo: chainStore.current,
                amount: sendConfigs.amountConfig,
                fee: sendConfigs.feeConfig,
                memo: sendConfigs.memoConfig,
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
                    analyticsStore.logEvent("Send token tx broadcasted", {
                      chainId: chainStore.current.chainId,
                      chainName: chainStore.current.chainName,
                      feeType: sendConfigs.feeConfig.feeType,
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
              console.log(e);
              smartNavigation.navigateSmart("NewHome", {});
            }
          }
        }}
      />
    </PageWithScrollView>
  );
});
