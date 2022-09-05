import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
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
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { TransactionStateView } from "./components/transaction-state-view";
import { TransactionDetailsView } from "./components/transaction-details-view";
import { TransactionActionView } from "./components/transaction-action-view";
import { PageWithScrollView } from "../../components";
import { useSmartNavigation } from "../../navigation-util";
import { useToastModal } from "../../providers/toast-modal";
import { useIntl } from "react-intl";
import { TransactionSignRequestView } from "./components/transaction-sign-request";
import { ScrollView, View, SafeAreaView } from "react-native";

export const TxResultScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    signInteractionStore,
    transactionStore,
    signClientStore,
  } = useStore();

  const toastModal = useToastModal();

  useUnmount(() => {
    signInteractionStore.rejectAll();
    transactionStore.rejectTransaction();
  });

  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const [signer, setSigner] = useState("");
  const [chainId, setChainId] = useState(chainStore.current.chainId);

  const chainInfo = chainStore.getChain(chainId || chainStore.current.chainId);
  const intl = useIntl();
  const [isInternal, setIsInternal] = useState(false);

  const [isPendingSignRequest, setIsPendingSignRequest] = useState(false);

  useEffect(() => {
    const pendingRequest = signClientStore.pendingRequest;
    const requestSession = signClientStore.requestSession(
      pendingRequest?.topic
    );
    if (pendingRequest && requestSession) {
      setIsPendingSignRequest(true);
    }
  }, [signClientStore]);

  const onRejectSignRequest = useCallback(
    async (name, isWC) => {
      if (isWC) {
        await signClientStore.rejectRequest();
      }
      signInteractionStore.rejectAll();
      toastModal.makeToast({
        title: intl.formatMessage(
          { id: "walletconnect.rejected" },
          { name: name }
        ),
        type: "infor",
        displayTime: 2000,
      });
      if (smartNavigation.canGoBack()) {
        smartNavigation.goBack();
      } else {
        smartNavigation.navigateSmart("NewHome", {});
      }
    },
    [intl, signInteractionStore, smartNavigation, toastModal]
  );

  const onConfirmSignRequest = useCallback(
    async (name) => {
      await transactionStore.startTransaction();
      toastModal.makeToast({
        title: intl.formatMessage(
          { id: "walletconnect.verified" },
          { name: name }
        ),
        type: "infor",
        displayTime: 2000,
      });
      if (smartNavigation.canGoBack()) {
        smartNavigation.goBack();
      } else {
        smartNavigation.navigateSmart("NewHome", {});
      }
    },
    [transactionStore, toastModal, smartNavigation]
  );

  useEffect(() => {
    let txTracer: TendermintTxTracer | undefined;
    if (transactionStore.txHash) {
      const txHash = Buffer.from(transactionStore.txHash).toString("hex");
      txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      console.log("Tx: ", txTracer);
      txTracer
        .traceTx(transactionStore.txHash)
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

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      const data = signInteractionStore.waitingData;
      setIsInternal(data.isInternal);
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

  function getPendingSigningView(): React.ReactNode {
    return (
      <PageWithScrollView
        backgroundColor={style.get("color-background").color}
        contentContainerStyle={style.flatten([
          "padding-y-16",
          "flex-1",
          "justify-between",
        ])}
      >
        <TransactionSignRequestView
          onApprove={onConfirmSignRequest}
          onReject={onRejectSignRequest}
        />
      </PageWithScrollView>
    );
  }

  function getResultView(): React.ReactNode {
    return (
      <View style={style.flatten(["flex-1", "background-color-background"])}>
        <ScrollView style={style.flatten(["flex-1"])}>
          <TransactionStateView />
          <TransactionDetailsView
            style={{
              marginTop: 38,
              marginBottom: 16,
              marginHorizontal: 16,
              flex: 1,
            }}
          />
        </ScrollView>
        <TransactionActionView style={style.flatten(["margin-bottom-12"])} />
        <SafeAreaView />
      </View>
    );
  }

  function isPendingSigning() {
    return !isInternal || isPendingSignRequest;
  }

  if (!isPendingSigning()) {
    transactionStore.startTransaction();
  }

  return isPendingSigning() ? getPendingSigningView() : getResultView();
});
