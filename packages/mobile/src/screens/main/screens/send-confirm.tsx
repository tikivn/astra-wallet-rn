import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect } from "react";
import { View, ImageBackground, SafeAreaView, Text } from "react-native";
import { PageWithScrollView } from "../../../components/page";
import { useStyle } from "../../../styles";
import { AddressInput, AddressQRCodeItem, AmountInput } from "../components";
import { useStore } from "../../../stores";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useIntl } from "react-intl";

export const SendConfirmScreen: FunctionComponent = observer(() => {
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
  const intl = useIntl();
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

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;
  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16", "padding-x-16"])}
      backgroundColor={style.get("color-background").color}
    >
      <AddressInput style={style.flatten(["margin-top-16"])} />
      <AmountInput style={style.flatten(["padding-12", "margin-top-16"])} />
      <Button
        text={intl.formatMessage({ id: "common.text.verify" })}
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === "send"}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
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
