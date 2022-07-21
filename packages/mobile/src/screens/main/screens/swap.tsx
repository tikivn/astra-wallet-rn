import { useSendTxConfig } from "@keplr-wallet/hooks";
import { Dec, IntPretty } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components";
import { ChangeTokenIcon } from "../../../components/icon/change-token";
import { PageWithScrollView } from "../../../components/page";
import { RectButton } from "../../../components/rect-button";
import { EthereumEndpoint } from "../../../config";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";
import { Keplr } from "@keplr-wallet/types";
import Web3 from "web3";
declare const window: Window &
  typeof globalThis & {
    astra: Keplr;
  };

import {
  AmountSwapInput,
  AmountSwapOutput,
  Dropdown,
  Tooltip,
} from "../components";
export const SwapScreen: FunctionComponent = observer(() => {
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

  // const toHexString = (bytes: any) =>
  //   bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

  // const get = async () => {
  //   const web3 = new Web3(
  //     new Web3.providers.HttpProvider("https://rpc.astranaut.dev")
  //   );
  //   const a = await web3.eth.getChainId();

  //   // const address = toHexString(account.evmosHexAddress)

  //   console.log("🚀 -> get -> address", account.name);
  //   // const b = await web3.eth.getBalance(
  //   //   "astra1rq90fld2wz4djfqjuklru8sc37jea9t222576z"
  //   // );
  //   // console.log("🚀 -> get -> web3.eth achain", a, b);
  // };
  // get();
  // useEffect(() => {}, []);

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

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16", "padding-x-16"])}
      backgroundColor={style.get("color-background").color}
    >
      {/* <View style={style.get("height-12")} /> */}
      <AmountSwapInput amountConfig={sendConfigs.amountConfig} />

      <View
        style={StyleSheet.flatten([
          {
            zIndex: 999,
          },
          style.flatten(["items-center", "justify-center", "height-16"]),
        ])}
      >
        <View
          style={StyleSheet.flatten([
            {
              width: 40,
              height: 40,
            },
          ])}
        >
          <RectButton
            style={StyleSheet.flatten([
              {
                borderRadius: 20,
                height: "100%",
                width: "100%",
                backgroundColor: Colors["gray-100"],
                paddingLeft: 4,
              },
              style.flatten(["items-center", "justify-center"]),
            ])}
            // onPress={}
            // rippleColor={rippleColor}
            // underlayColor={underlayColor}
            activeOpacity={1}
          >
            <ChangeTokenIcon color={style.get("color-white").color} />
          </RectButton>
        </View>
      </View>
      <AmountSwapOutput amountConfig={sendConfigs.amountConfig} />
      <View style={style.get("height-12")} />

      {/* start describe */}
      <View
        style={style.flatten([
          "flex-row",
          "items-center",
          "justify-between",
          "margin-top-24",
          "margin-bottom-16",
        ])}
      >
        <Tooltip text={intl.formatMessage({ id: "swap.exchangeRate" })} />
        <Text style={style.flatten(["color-gray-10", "body3"])}>
          <FormattedMessage
            id="validator.details.percentValue"
            values={{
              percent: new IntPretty(new Dec(12))
                .moveDecimalPointRight(2)
                .maxDecimals(2)
                .trim(true)
                .toString(),
            }}
          />
        </Text>
      </View>
      <View
        style={style.flatten([
          "flex-row",
          "items-center",
          "justify-between",
          "margin-bottom-16",
        ])}
      >
        <Tooltip text={intl.formatMessage({ id: "swap.transactionFee" })} />
        <Text style={style.flatten(["color-gray-10", "body3"])}>
          <FormattedMessage
            id="validator.details.percentValue"
            values={{
              percent: new IntPretty(new Dec(12))
                .moveDecimalPointRight(2)
                .maxDecimals(2)
                .trim(true)
                .toString(),
            }}
          />
        </Text>
      </View>
      <View
        style={style.flatten(["flex-row", "items-center", "justify-between"])}
      >
        <Tooltip text={intl.formatMessage({ id: "swap.priceSlippage" })} />
        <Dropdown data={[1, 2, 3]} onSelect={console.log} />
      </View>
      {/* end describe */}

      <Button
        text={intl.formatMessage({ id: "swap.buttonText" })}
        size="large"
        containerStyle={style.flatten(["border-radius-4", "margin-top-34"])}
        textStyle={style.flatten(["subtitle2"])}
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "send"}
        onPress={async () => {
          console.log("123");
        }}
      />
    </PageWithScrollView>
  );
});
