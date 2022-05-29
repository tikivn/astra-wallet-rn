import React, { FunctionComponent, useEffect, useState } from "react";
import { View } from "react-native";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
} from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { useUnmount } from "../../hooks";
import WalletConnect from "@walletconnect/client";
import { useStyle } from "../../styles";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";
import { processTransaction } from "./models/transaction";
import { Button, PageWithScrollView } from "../../components";
import { UserBalance } from "./components/user-balance";
import { TransactionDetails } from "./components/transaction-details";
import { WCAppLogoAndName } from "../../components/wallet-connect";
import { observer } from "mobx-react-lite";

export const TxConfirmResultScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    walletConnectStore,
    signInteractionStore,
  } = useStore();
  useUnmount(() => {
    console.log("__DEBUG__ sign interaction store reject all");
    signInteractionStore.rejectAll();
  });

  // Check that the request is from the wallet connect.
  // If this is undefiend, the request is not from the wallet connect.
  const [wcSession, setWCSession] = useState<
    WalletConnect["session"] | undefined
  >();

  const style = useStyle();

  const [signer, setSigner] = useState("");

  const [chainId, setChainId] = useState(chainStore.current.chainId);

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

  const signDocWapper = signInteractionStore.waitingData?.data.signDocWrapper;
  const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
  amountConfig.setSignDocHelper(signDocHelper);

  const [isInternal, setIsInternal] = useState(false);

  console.log("__SIGNER__ signer:", signer);

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

      if (
        data.data.msgOrigin &&
        WCMessageRequester.isVirtualSessionURL(data.data.msgOrigin)
      ) {
        const sessionId = WCMessageRequester.getSessionIdFromVirtualURL(
          data.data.msgOrigin
        );
        setWCSession(walletConnectStore.getSession(sessionId));
      } else {
        setWCSession(undefined);
      }
    }
  }, [
    feeConfig,
    gasConfig,
    memoConfig,
    signDocHelper,
    signInteractionStore.waitingData,
    walletConnectStore,
  ]);

  const transactionData = processTransaction(
    { signDocHelper: signDocHelper, feeConfig: feeConfig },
    chainId
  );

  return (
    <PageWithScrollView
      style={style.flatten(["margin-top-16", "padding-x-16"])}
      backgroundColor={style.get("color-background").color}
    >
      <View>
        <View style={style.get("background-color-background")}>
          <UserBalance />
          <TransactionDetails {...transactionData} />
        </View>
        {wcSession ? (
          <WCAppLogoAndName
            containerStyle={style.flatten(["margin-y-14"])}
            peerMeta={wcSession.peerMeta}
          />
        ) : null}
        <Button
          text="Xác nhận 1"
          size="large"
          containerStyle={style.flatten(["border-radius-4", "margin-top-32"])}
          textStyle={style.flatten(["subtitle2"])}
          disabled={
            signDocWapper == null ||
            signDocHelper.signDocWrapper == null ||
            memoConfig.error != null ||
            feeConfig.error != null
          }
          loading={signInteractionStore.isLoading}
          onPress={async () => {
            try {
              if (signDocHelper.signDocWrapper) {
                await signInteractionStore.approveAndWaitEnd(
                  signDocHelper.signDocWrapper
                );
              }
            } catch (error) {
              console.log(error);
            }
          }}
        />
      </View>
    </PageWithScrollView>
  );
});
