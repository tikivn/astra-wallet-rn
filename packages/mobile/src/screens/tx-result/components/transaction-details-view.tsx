import { useFeeConfig, useGasConfig, useMemoConfig, useSignDocAmountConfig, useSignDocHelper } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { IRow, ListRowView } from "../../../components";
import { useStore } from "../../../stores";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { AnyWithUnpacked } from "@keplr-wallet/cosmos";
import { renderAminoMessage, renderAminoMessages } from "../models/amino";
import { renderDirectMessages } from "../models/direct";

export const TransactionDetailsView: FunctionComponent<{
  style?: ViewStyle
}> = observer(({
  style,
}) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    walletConnectStore,
    signInteractionStore,
  } = useStore();

  const [signer, setSigner] = useState("");
  // const [isInternal, setIsInternal] = useState(false);
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
    walletConnectStore,
  ]);

  const mode = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode
    : "none";
  const msgs = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode === "amino"
      ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
      : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
    : [];
  console.log("__MODE__", mode, msgs);

  var rows: IRow[] = [];

  if (mode === "amino") {
    rows = renderAminoMessages(
      chainId,
      msgs as readonly AminoMsg[],
      feeConfig,
    );
  } else if (mode === "direct") {
    renderDirectMessages(
      chainId,
      msgs as AnyWithUnpacked[],
      feeConfig,
    );
  }

  return (
    <View style={style}>
      <ListRowView rows={rows} />
    </View>
  );
});
