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
import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { RouteProp, useRoute } from "@react-navigation/native";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { TransactionStateView } from "./components/transaction-state-view";
import { TransactionDetailsView } from "./components/transaction-details-view";
import { TxState, TxType } from "../../stores/transaction";
import { TransactionActionView } from "./components/transaction-action-view";
import { SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

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

  const [signer, setSigner] = useState("");
  const [chainId, setChainId] = useState(chainStore.current.chainId);

  const chainInfo = chainStore.getChain(chainId);

  useEffect(() => {
    let txTracer: TendermintTxTracer | undefined;

    if (transactionStore.txHash) {
      const txHash = Buffer.from(transactionStore.txHash).toString("hex");
      txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      txTracer
        .traceTx(Buffer.from(txHash, "hex"))
        .then((tx) => {
          console.log("__GOT TX__ ", tx);
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
  transactionStore.updateSignDocHelper(signDocHelper);
  // transactionStore.updateTxAmount(amountConfig);

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
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
      // transactionStore.updateSignDocHelper(signDocHelper);
    }
  }, [
    feeConfig,
    gasConfig,
    memoConfig,
    signDocHelper,
    signInteractionStore.waitingData,
  ]);

  // const mode = signDocHelper.signDocWrapper
  //   ? signDocHelper.signDocWrapper.mode
  //   : "none";
  // const msgs = signDocHelper.signDocWrapper
  //   ? signDocHelper.signDocWrapper.mode === "amino"
  //     ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
  //     : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
  //   : [];

  // async function sendTransaction() {
  //   try {
  //     if (signDocHelper.signDocWrapper) {
  //       await signInteractionStore.approveAndWaitEnd(
  //         signDocHelper.signDocWrapper
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // sendTransaction();
  transactionStore.startTransaction();

  return (
    <SafeAreaView style={{
      backgroundColor: style.get("color-background").color,
      flex: 1,
    }}>
      <ScrollView >
        <TransactionStateView />
        <TransactionDetailsView style={{ marginTop: 38, marginBottom: 16, marginHorizontal: 16, flex: 1, }} />
      </ScrollView>
      <TransactionActionView />
    </SafeAreaView>
  );
});
