import React, { FunctionComponent, useEffect, useState } from "react";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
} from "@keplr-wallet/hooks";
import { Button } from "../../components/button";
import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { PageWithScrollView } from "../../components/page";
import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { TransactionStateView } from "./components/transaction-state-view";
import { TransactionDetailsView } from "./components/transaction-details-view";
import * as WebBrowser from "expo-web-browser";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { TxState, TxType } from "../../stores/transaction";
import { View } from "react-native";

export const TxResultScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    signInteractionStore,
    transactionStore,
  } = useStore();

  useUnmount(() => {
    signInteractionStore.rejectAll();
    transactionStore.rejectTransaction();
  });

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          txType: TxType,
          txState: TxState;
        }
      >,
      string
    >
  >();

  console.log("__PARAMS__", route.params);

  const style = useStyle();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [signer, setSigner] = useState("");
  const [chainId, setChainId] = useState(chainStore.current.chainId);

  const chainInfo = chainStore.getChain(chainId);

  useEffect(() => {
    let txTracer: TendermintTxTracer | undefined;

    if (isFocused && transactionStore.txHash) {
      const txHash = Buffer.from(transactionStore.txHash).toString("hex");
      txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      txTracer
        .traceTx(Buffer.from(txHash, "hex"))
        .then((tx) => {
          console.log("__GOT TX__ ",tx);
          if (tx.code == null || tx.code === 0) {
            transactionStore.updateTxState("success");
            console.log("__TRANS__success", chainId, txHash);
          } else {
            transactionStore.updateTxState("failure");
            console.log("__TRANS__failure", chainId, txHash);
          }
        })
        .catch((e) => {
          console.log(`Failed to trace the tx (${txHash})`, e);
        });
    }

    return () => {
      if (txTracer) {
        txTracer.close();
      }
    };
  }, [transactionStore.txHash]);

  // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.
  const gasConfig = useGasConfig(chainStore, chainId, 1);
  const amountConfig = useSignDocAmountConfig(
    chainStore,
    accountStore,
    chainId,
    signer
  );
  const feeConfig = useFeeConfig(
    chainStore,
    queriesStore,
    chainId,
    signer,
    amountConfig,
    gasConfig
  );
  const memoConfig = useMemoConfig(chainStore, chainId);

  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
  amountConfig.setSignDocHelper(signDocHelper);

  const amount = new CoinPretty(
    amountConfig.sendCurrency,
    new Dec(amountConfig.getAmountPrimitive().amount)
  )
    .trim(true)
    .maxDecimals(6)
    .upperCase(true)
    .toString();

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
      // setIsInternal(data.isInternal);
      signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
      setChainId(data.data.signDocWrapper.chainId);
      gasConfig.setGas(data.data.signDocWrapper.gas);
      memoConfig.setMemo(data.data.signDocWrapper.memo);
      if (
        data.data.signOptions.preferNoSetFee &&
        data.data.signDocWrapper.fees[0]
      ) {
        feeConfig.setManualFee(data.data.signDocWrapper.fees[0]);
      } else {
        feeConfig.setFeeType("average");
      }
      setSigner(data.data.signer);
    }
  }, [
    feeConfig,
    gasConfig,
    memoConfig,
    signDocHelper,
    signInteractionStore.waitingData,
  ]);

  async function sendTransaction() {
    try {
      if (signDocHelper.signDocWrapper) {
        await signInteractionStore.approveAndWaitEnd(
          signDocHelper.signDocWrapper
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  sendTransaction();

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16"])}
      backgroundColor={style.get("color-background").color}
    >
      <TransactionStateView amount={amount} />
      <TransactionDetailsView style={{ marginTop: 38, marginHorizontal: 16, }} />

      <View style={{ marginHorizontal: 16, }}>
        {chainInfo.raw.txExplorer && (
          <Button
            containerStyle={style.flatten(["margin-top-16"])}
            size="default"
            text="Xem chi tiết trên Astra Scan"//{`View on ${chainInfo.raw.txExplorer.name}`}
            mode="text"
            onPress={() => {
              if (chainInfo.raw.txExplorer && transactionStore.txHash) {
                const txHash = Buffer.from(transactionStore.txHash).toString("hex").toUpperCase();
                WebBrowser.openBrowserAsync(
                  chainInfo.raw.txExplorer.txUrl.replace(
                    "{txHash}",
                    txHash
                  )
                );
              }
            }}
          />
        )}
        <Button
          text="Trang chủ"
          size="large"
          containerStyle={style.flatten(["border-radius-4", "margin-top-32"])}
          textStyle={style.flatten(["subtitle2"])}
          // disabled={
          //   signDocWapper == null ||
          //   signDocHelper.signDocWrapper == null ||
          //   memoConfig.error != null ||
          //   feeConfig.error != null
          // }
          // loading={signInteractionStore.isLoading}
          onPress={async () => {
            navigation.navigate("NewHome");
          }}
        />
      </View>
    </PageWithScrollView>
  );
});
