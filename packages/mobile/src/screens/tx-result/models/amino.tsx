import { CosmosMsgOpts, CosmwasmMsgOpts, SecretMsgOpts } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { IRow } from "../../../components";
import { useStore } from "../../../stores";
import { MessageObj, MsgBeginRedelegate, MsgDelegate, MsgExecuteContract, MsgSend, MsgTransfer, MsgUndelegate, MsgVote, MsgWithdrawDelegatorReward, renderMsgBeginRedelegate, renderMsgDelegate, renderMsgSend, renderMsgTransfer, renderMsgUndelegate, renderMsgVote, renderMsgWithdrawDelegatorReward } from "./messages";

export function renderAminoMessages(): IRow[] {
  const { accountStore, chainStore, transactionStore } = useStore();

  const msgs = transactionStore.txMsgs as readonly AminoMsg[];
  if (msgs.length == 0) {
    return [];
  }

  const chainId = transactionStore.signDocHelper?.signDocWrapper?.chainId ?? chainStore.current.chainId;
  const currencies = chainStore.getChain(chainId).currencies;
  const msgOpts: {
    readonly cosmos: {
      readonly msgOpts: CosmosMsgOpts;
    };
    readonly cosmwasm: {
      readonly msgOpts: CosmwasmMsgOpts;
    };
    readonly secret: {
      readonly msgOpts: SecretMsgOpts;
    };
  } = accountStore.getAccount(chainId);

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

  const msg: MessageObj = msgs[0];

  try {
    if (msg.type === msgOpts.cosmos.msgOpts.send.native.type) {
      const value = msg.value as MsgSend["value"];
      return renderMsgSend(
        currencies,
        value.amount.map((coin) => {
          return { amount: coin.amount, denom: coin.denom };
        }),
        feeString,
        value.to_address,
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.redelegate.type) {
      const value = msg.value as MsgBeginRedelegate["value"];
      return renderMsgBeginRedelegate(
        currencies,
        value.amount,
        value.validator_src_address,
        value.validator_dst_address,
        feeString,
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.undelegate.type) {
      const value = msg.value as MsgUndelegate["value"];
      return renderMsgUndelegate(
        value.validator_address,
        feeString,
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.delegate.type) {
      const value = msg.value as MsgDelegate["value"];
      return renderMsgDelegate(
        currencies,
        value.amount,
        feeString,
        value.validator_address
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.withdrawRewards.type) {
      const addresses = msgs.filter((msg) => {
        return msg.type === msgOpts.cosmos.msgOpts.withdrawRewards.type
      }).map((msg) => {
        return msg.value as MsgWithdrawDelegatorReward["value"];
      });

      return renderMsgWithdrawDelegatorReward(
        addresses,
        feeString
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.ibcTransfer.type) {
      const value = msg.value as MsgTransfer["value"];
      return renderMsgTransfer(
        currencies,
        value.token,
        value.receiver,
        value.source_channel
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.govVote.type) {
      const value = msg.value as MsgVote["value"];
      return renderMsgVote(value.proposal_id, value.option);
    }

    // if (msg.type === "wasm/MsgInstantiateContract") {
    //   const value = msg.value as MsgInstantiateContract["value"];
    //   return renderMsgInstantiateContract(
    //     currencies,
    //     intl,
    //     value.init_funds,
    //     value.admin,
    //     value.code_id,
    //     value.label,
    //     value.init_msg
    //   );
    // }

    // if (msg.type === msgOpts.cosmwasm.msgOpts.executeWasm.type) {
    //   const value = msg.value as MsgExecuteContract["value"];
    //   return renderMsgExecuteContract(
    //     currencies,
    //     intl,
    //     value.funds ?? [],
    //     undefined,
    //     value.contract,
    //     value.msg
    //   );
    // }

    // if (msg.type === msgOpts.secret.msgOpts.executeSecretWasm.type) {
    //   const value = msg.value as MsgExecuteContract["value"];
    //   return renderMsgExecuteContract(
    //     currencies,
    //     intl,
    //     value.sent_funds ?? [],
    //     value.callback_code_hash,
    //     value.contract,
    //     value.msg
    //   );
    // }

    // if (msg.type === "cyber/Link") {
    //   const value = msg.value as MsgLink["value"];

    //   const cyberlinks: { from: string; to: string }[] = [];

    //   for (const link of value.links) {
    //     cyberlinks.push({
    //       from: link.from,
    //       to: link.to,
    //     });
    //   }

    //   return {
    //     icon: "fas fa-paper-plane",
    //     title: intl.formatMessage({
    //       id: "sign.list.message.cyber/Link.title",
    //     }),
    //     content: (
    //       <FormattedMessage
    //         id="sign.list.message.cyber/Link.content"
    //         values={{
    //           b: (...chunks: any[]) => <b>{chunks}</b>,
    //           br: <br />,
    //           neuron: Bech32Address.shortenAddress(value.neuron, 20),
    //           link: cyberlinks
    //             .map((link) => {
    //               return `${Hash.truncHashPortion(
    //                 link.from,
    //                 7,
    //                 7
    //               )} → ${Hash.truncHashPortion(link.to, 7, 7)}`;
    //             })
    //             .join(", "),
    //         }}
    //       />
    //     ),
    //   };
    // }
  } catch (e) {
    console.log(e);
  }

  return [];
}
