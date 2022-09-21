import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
} from "@keplr-wallet/stores";
import { IRow } from "../../../components";
import { TransactionStore } from "../../../stores";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgSend,
  MsgSwap,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgSend,
  renderMsgSign,
  renderMsgSwap,
  renderMsgUndelegate,
  renderMsgWithdrawDelegatorReward,
} from "./messages";

export const renderAminoMessages = (
  chainId: string,
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>,
  transactionStore: TransactionStore
): IRow[] => {
  // const msgs = transactionStore.txMsgs as readonly AminoMsg[];
  // console.log("---BEGIN---");
  // msgs.forEach((msg, index) => {
  //   console.log(index, "- type:", msg.type);
  // });
  // console.log("--END---");
  // if (msgs.length == 0) {
  //   return [];
  // }

  const account = accountStore.getAccount(chainId);

  const msg = transactionStore.rawData;

  if (!msg) {
    return [];
  }

  try {
    if (msg.type === account.cosmos.msgOpts.send.native.type) {
      const value = msg.value as MsgSend["value"];
      return renderMsgSend(value);
    }

    if (msg.type === account.cosmos.msgOpts.redelegate.type) {
      const value = msg.value as MsgBeginRedelegate["value"];
      return renderMsgBeginRedelegate(value);
    }

    if (msg.type === account.cosmos.msgOpts.undelegate.type) {
      const value = msg.value as MsgUndelegate["value"];
      return renderMsgUndelegate(value);
    }

    if (msg.type === account.cosmos.msgOpts.delegate.type) {
      const value = msg.value as MsgDelegate["value"];
      return renderMsgDelegate(value);
    }

    if (msg.type === account.cosmos.msgOpts.withdrawRewards.type) {
      const value = msg.value as MsgWithdrawDelegatorReward["value"];
      return renderMsgWithdrawDelegatorReward(value);
    }

    if (msg.type === "wallet-swap") {
      const value = msg.value as MsgSwap;
      const msgEther = transactionStore.txMsgs;
      if (msgEther && msgEther.length > 0) {
        const data = msgEther[0] as any;
        if (data.type === "sign/MsgSignData") {
          const dataAsciiStr = Buffer.from(data.value.data, "base64").toString(
            "ascii"
          );
          const dataParse = JSON.parse(dataAsciiStr);
          return renderMsgSwap(value, dataParse);
        }
        return [];
      }
      return [];
    }
  } catch (e) {
    console.log(e);
  }

  return [];
};
