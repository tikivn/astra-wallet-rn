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
import { TxState, TxType } from "../../../stores/transaction";
import { Typos, Colors } from "../../../styles";

export const TransactionStateView: FunctionComponent<{
  style?: ViewStyle;
}> = observer(({ style }) => {
  const { transactionStore } = useStore();

  const [txState, setTxState] = useState(transactionStore.txState);
  const [amountText, setAmountText] = useState("");

  useEffect(() => {
    setTxState(transactionStore.txState);
  }, [transactionStore.txState]);

  useEffect(() => {
    setAmountText(transactionStore.txAmount?.toString() ?? "");
  }, [transactionStore.txAmount]);

  const isFailure = txState == "failure";

  const intl = useIntl();

  function getMainText(type: TxType, state: TxState): string {
    // send:        Đang gửi - Đã gửi thành công
    // delegate:    Đang chuyển tiền - Đầu tư thành công
    // undelegate:  Đang rút tiền - Rút tiền thành công
    // redelegate:  Đang chuyển đổi - Chuyển đổi thành công
    // withdraw:    Đang chuyển tiền lãi - Tiền lãi đã được chuyển đến bạn
    // swap:
    const allMainText: Record<string, Record<string, string>> = {
      send: {
        pending: intl.formatMessage({ id: "tx.result.state.send.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.send.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.send.failure" }),
      },
      delegate: {
        pending: intl.formatMessage({ id: "tx.result.state.delegate.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.delegate.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.delegate.failure" }),
      },
      undelegate: {
        pending: intl.formatMessage({ id: "tx.result.state.undelegate.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.undelegate.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.undelegate.failure" }),
      },
      redelegate: {
        pending: intl.formatMessage({ id: "tx.result.state.redelegate.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.redelegate.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.redelegate.failure" }),
      },
      withdraw: {
        pending: intl.formatMessage({ id: "tx.result.state.withdraw.pending" }),
        success: intl.formatMessage({ id: "tx.result.state.withdraw.success" }),
        failure: intl.formatMessage({ id: "tx.result.state.withdraw.failure" }),
      },
      swap: {
        pending: "",
        success: "",
        failure: "",
      },
    };

    const txTypeString = type?.toLocaleLowerCase() ?? "send";
    const txStateString = state?.toLocaleLowerCase() ?? "pending";

    return allMainText[txTypeString][txStateString];
  }

  const mainText = getMainText(transactionStore.txType, txState);
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

  var initialStepText = intl.formatMessage({ id: "tx.result.state.initialized" });
  var finalStepText = intl.formatMessage({ id: "tx.result.state.processing" });
  var lineState: StepViewState = "inactive";
  var type: StepViewType = "dot";
  var stateColors: StepViewStateColors = StepViewStateColorsBlue;

  if (txState == "success") {
    finalStepText = intl.formatMessage({ id: "tx.result.state.sucess" });
    lineState = "active";
    type = "tick";
    stateColors = StepViewStateColorsGreen;
  }

  function animationSource() {
    var anim = require("../../../assets/lottie/tx-loading.json");
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
    </View>
  );
});
