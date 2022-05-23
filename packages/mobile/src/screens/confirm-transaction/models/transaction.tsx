import { FeeConfig, SignDocHelper } from "@keplr-wallet/hooks";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { IAmount } from "./amount";
import { useStore } from "../../../stores";
import { processTransactionAmino } from "./amino";

export interface ITransaction {
  fromAddress?: string;
  toAddress?: string;
  amounts?: IAmount[];
  feeAmount?: IAmount;
}

export function processTransaction(data: {
  signDocHelper: SignDocHelper,
  feeConfig: FeeConfig,
}, chainId: string): ITransaction {
  const {
    chainStore,
    accountStore,
    // queriesStore,
    // walletConnectStore,
    // signInteractionStore,
  } = useStore();

  const {
    signDocHelper,
    feeConfig,
  } = data;
  
  const mode = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode
    : "none";
  const msgs = signDocHelper.signDocWrapper
    ? signDocHelper.signDocWrapper.mode === "amino"
      ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
      : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
    : [];

  // const transactionData = (() => {
    if (mode === "amino") {
      const msg = msgs[0] as AminoMsg;
      const account = accountStore.getAccount(chainId);
      const chainInfo = chainStore.getChain(chainId);
      const { transaction } = processTransactionAmino(
        account,
        msg,
        feeConfig,
        chainInfo.currencies
      );

      return {
        ...transaction,
      };
    // } else if (mode === "direct") {
    //   return (msgs as AnyWithUnpacked[]).map((msg, i) => {
    //     const chainInfo = chainStore.getChain(chainId);
    //     const { title, content } = renderDirectMessage(
    //       msg,
    //       chainInfo.currencies
    //     );

    //     return {};

    //   });
    }
    return {};
  // });
}