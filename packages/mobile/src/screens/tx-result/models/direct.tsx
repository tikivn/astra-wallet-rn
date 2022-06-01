import { AnyWithUnpacked, UnknownMessage } from "@keplr-wallet/cosmos";
import {
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgSend,
  renderMsgUndelegate,
} from "./messages";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { useStore } from "../../../stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { IRow } from "../../../components";

export function renderDirectMessages(): IRow[] {
  const { chainStore, transactionStore } = useStore();

  const msgs = transactionStore.txMsgs as AnyWithUnpacked[]

  if (msgs.length == 0) {
    return [];
  }

  const chainId = transactionStore.signDocHelper?.signDocWrapper?.chainId ?? chainStore.current.chainId;
  const currencies = chainStore.getChain(chainId).currencies;

  var feeString = transactionStore.txFee?.toString() ?? "";

  const fees = transactionStore.signDocHelper?.signDocWrapper?.fees;
  if (feeString.length == 0 && fees && fees.length != 0) {
    const fee = fees[0];

    const appCurrencies = currencies.filter((currency) => {
      return fee.denom == currency.coinGeckoId;
    });

    console.log("__FEE__", transactionStore.signDocHelper?.signDocWrapper?.fees, appCurrencies);

    if (appCurrencies.length != 0) {
      feeString = new CoinPretty(
        appCurrencies[0],
        new Dec(fee.amount)
      ).trim(true).upperCase(true).toString();
    }
  }

  const msg = msgs[0];

  try {
    if (msg instanceof UnknownMessage) {
      return [];
    }

    if ("unpacked" in msg) {
      switch (msg.typeUrl) {
        case "/cosmos.bank.v1beta1.MsgSend": {
          const sendMsg = msg.unpacked as MsgSend;
          return renderMsgSend(
            currencies,
            sendMsg.amount,
            feeString,
            sendMsg.toAddress
          );
        }
        case "/cosmos.staking.v1beta1.MsgDelegate": {
          const delegateMsg = msg.unpacked as MsgDelegate;
          if (delegateMsg.amount) {
            return renderMsgDelegate(
              currencies,
              delegateMsg.amount,
              feeString,
              delegateMsg.validatorAddress
            );
          }
          break;
        }
        case "/cosmos.staking.v1beta1.MsgBeginRedelegate": {
          const redelegateMsg = msg.unpacked as MsgBeginRedelegate;
          if (redelegateMsg.amount) {
            return renderMsgBeginRedelegate(
              currencies,
              redelegateMsg.amount,
              redelegateMsg.validatorSrcAddress,
              redelegateMsg.validatorDstAddress,
              feeString,
            );
          }
          break;
        }
        case "/cosmos.staking.v1beta1.MsgUndelegate": {
          const undelegateMsg = msg.unpacked as MsgUndelegate;
          if (undelegateMsg.amount) {
            return renderMsgUndelegate(
              undelegateMsg.validatorAddress,
              feeString
            );
          }
          break;
        }
        // case "/cosmwasm.wasm.v1.MsgExecuteContract": {
        //   const executeContractMsg = msg.unpacked as MsgExecuteContract;
        //   return renderMsgExecuteContract(
        //     currencies,
        //     intl,
        //     executeContractMsg.funds,
        //     undefined,
        //     executeContractMsg.contract,
        //     JSON.parse(fromUtf8(executeContractMsg.msg))
        //   );
        // }
      }
    }
  } catch (e) {
    console.log(e);
  }

  return [];
}
