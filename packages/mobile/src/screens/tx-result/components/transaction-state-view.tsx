import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Text, View, ViewStyle } from "react-native";
import {
  StepView,
  StepViewState,
  StepViewStateColors,
  StepViewStateColorsBlue,
  StepViewStateColorsGreen,
  StepViewType,
} from "../../../components/foundation-view/step-view";
import { useStore } from "../../../stores";
import { TxState } from "../../../stores/transaction";
import { Typos, Colors } from "../../../styles";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { formatCoin } from "../../../common/utils";

export const TransactionStateView: FunctionComponent<{
  style?: ViewStyle;
}> = observer(({ style }) => {
  const { transactionStore, accountStore, chainStore } = useStore();

  const [txState, setTxState] = useState(transactionStore.txState);
  const [amountText, setAmountText] = useState("");
  const msgs = transactionStore.txMsgs as readonly AminoMsg[];

  useEffect(() => {
    setTxState(transactionStore.txState);
  }, [transactionStore.txState]);

  useEffect(() => {
    setAmountText(formatCoin(transactionStore.txAmount));
  }, [transactionStore.txAmount]);

  const isFailure = txState == "failure";

  const intl = useIntl();

  function getMainText(type: string, state: TxState): string {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const allMainText: Record<string, Record<string, string>> = {
      [account.cosmos.msgOpts.send.native.type]: {
        pending: intl.formatMessage({ id: "tx.result.state.send.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.send.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.send.failure" }),
      },
      [account.cosmos.msgOpts.delegate.type]: {
        pending: intl.formatMessage({ id: "tx.result.state.delegate.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.delegate.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.delegate.failure" }),
      },
      [account.cosmos.msgOpts.undelegate.type]: {
        pending: intl.formatMessage({
          id: "tx.result.state.undelegate.pending",
        }),
        success: intl.formatMessage({
          id: "tx.result.state.undelegate.success",
        }),
        failure: intl.formatMessage({
          id: "tx.result.state.undelegate.failure",
        }),
      },
      [account.cosmos.msgOpts.redelegate.type]: {
        pending: intl.formatMessage({
          id: "tx.result.state.redelegate.pending",
        }),
        success: intl.formatMessage({
          id: "tx.result.state.redelegate.success",
        }),
        failure: intl.formatMessage({
          id: "tx.result.state.redelegate.failure",
        }),
      },
      [account.cosmos.msgOpts.withdrawRewards.type]: {
        pending: intl.formatMessage({ id: "tx.result.state.withdraw.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.withdraw.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.withdraw.failure" }),
      },
      ["wallet-swap"]: {
        pending: intl.formatMessage({ id: "tx.result.state.swap.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.swap.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.swap.failure" }),
      },
    };

    const mainText = allMainText[type];

    if (!mainText) {
      return "";
    }

    const txStateString = state?.toLowerCase() ?? "";

    return mainText[txStateString] ?? "";
  }
  const typeMsg =
    msgs[0].type !== "sign/MsgSignData"
      ? msgs[0].type
      : transactionStore.rawData?.type || "";

  const isShowStep = typeMsg !== "wallet-swap";
  const mainText = getMainText(typeMsg, txState);
  const errorText = intl.formatMessage({ id: "tx.result.state.error" });
  const subText = isFailure ? errorText : amountText;

  const mainTextStyle = {
    ...(isFailure
      ? Typos["text-x-large-semi-bold"]
      : Typos["text-base-regular"]),
    color: isFailure ? Colors["gray-10"] : Colors["gray-30"],
    marginTop: 8,
  };

  const subTextStyle = {
    ...(isFailure ? Typos["text-base-regular"] : Typos["text-2x-large-medium"]),
    color: isFailure ? Colors["gray-30"] : Colors["gray-10"],
    marginTop: isFailure ? 8 : 4,
  };

  const initialStepText = intl.formatMessage({
    id: "tx.result.state.initialized",
  });
  let finalStepText = intl.formatMessage({ id: "tx.result.state.processing" });
  let lineState: StepViewState = "inactive";
  let type: StepViewType = "dot";
  let stateColors: StepViewStateColors = StepViewStateColorsBlue;

  if (txState == "success") {
    finalStepText = intl.formatMessage({ id: "tx.result.state.sucess" });
    lineState = "active";
    type = "tick";
    stateColors = StepViewStateColorsGreen;
  }

  function animationSource() {
    let anim = require("../../../assets/lottie/tx-loading.json");
    switch (txState) {
      case "success":
        anim = require("../../../assets/lottie/tx-loading-complete.json");
        break;
      case "failure":
        anim = require("../../../assets/lottie/tx-loading-error.json");
        break;
      default:
        break;
    }
    return anim;
  }

  function animationLoop() {
    return txState != "success" && txState != "failure";
  }

  return (
    <View style={{ alignItems: "center", marginTop: 60, ...style }}>
      <LottieView
        autoPlay
        loop={animationLoop()}
        source={animationSource()}
        style={{
          width: 120,
          height: 120,
        }}
      />

      {isShowStep && (
        <View
          style={{ alignItems: "center", paddingHorizontal: 16, width: "100%" }}
        >
          <Text style={mainTextStyle}>{mainText}</Text>
          <Text style={subTextStyle}>{subText}</Text>

          <View
            style={{
              flexDirection: "row",
              alignContent: "stretch",
              marginTop: 26,
            }}
          >
            <StepView
              text={initialStepText}
              state="inactive"
              stateColors={stateColors}
              position="start"
              type="dot"
              lineState={lineState}
            />
            <StepView
              text={finalStepText}
              state="active"
              stateColors={stateColors}
              position="end"
              type={type}
              lineState={lineState}
            />
          </View>
        </View>
      )}
    </View>
  );
});
