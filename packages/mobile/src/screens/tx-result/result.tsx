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
import { RouteProp, useRoute } from "@react-navigation/native";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { TransactionStateView } from "./components/transaction-state-view";
import { TransactionDetailsView } from "./components/transaction-details-view";
import { TxState, TxType } from "../../stores/transaction";
import { TransactionActionView } from "./components/transaction-action-view";
import { PageWithScrollView } from "../../components";
import { TransactionRequestView } from "./components/transaction-request";
import { useSmartNavigation } from "../../navigation";
import { useToastModal } from "../../providers/toast-modal";
import { useIntl } from "react-intl";

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

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          txState: TxState;
        }
      >,
      string
    >
  >();

  console.log("__PARAMS__", route.params);

  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const [signer, setSigner] = useState("");
  const [chainId, setChainId] = useState(chainStore.current.chainId);

  const chainInfo = chainStore.getChain(chainId);
  const intl = useIntl();
  const [waitApprove, setWaitApprove] = useState(false);

  useEffect(() => {
    const pendingRequest = signClientStore.pendingRequest;
    const requestSession = signClientStore.requestSession(
      pendingRequest?.topic
    );
    if (pendingRequest && requestSession) {
      setWaitApprove(true);
    }
  }, [signClientStore]);

  const onRejectRequest = useCallback(
    async (name) => {
      await signClientStore.rejectRequest();
      // signInteractionStore.rejectAll();
      toastModal.makeToast({
        title: intl
          .formatMessage({ id: "walletconnect.rejected" })
          .replace("${name}", `${name}`),
        type: "infor",
        displayTime: 2000,
      });
      smartNavigation.navigateSmart("NewHome", {});
    },
    [signClientStore, smartNavigation, toastModal]
  );

  const onApproveRequest = useCallback(
    async (name) => {
      await transactionStore.startTransaction();
      toastModal.makeToast({
        title: intl
          .formatMessage({ id: "walletconnect.verified" })
          .replace("${name}", `${name}`),
        type: "infor",
        displayTime: 2000,
      });
      smartNavigation.navigateSmart("NewHome", {});
    },
    [transactionStore, toastModal, smartNavigation]
  );

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

  if (!waitApprove) {
    transactionStore.startTransaction();
  }
  return (
    <PageWithScrollView
      backgroundColor={style.get("color-background").color}
      contentContainerStyle={style.flatten([
        "padding-y-16",
        "flex-1",
        "justify-between",
      ])}
    >
      {waitApprove ? (
        <TransactionRequestView
          onApprove={onApproveRequest}
          onReject={onRejectRequest}
        />
      ) : (
        <React.Fragment>
          <TransactionStateView />
          <TransactionDetailsView
            style={{
              marginTop: 38,
              marginBottom: 16,
              marginHorizontal: 16,
              flex: 1,
            }}
          />
          <TransactionActionView />
        </React.Fragment>
      )}
    </PageWithScrollView>
  );
});
