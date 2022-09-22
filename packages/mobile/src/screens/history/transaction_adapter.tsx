import { TxResponse } from "@keplr-wallet/stores/build/query/cosmos/tx/types";

export interface Coin {
  denom: string,
  amount: string,
}

export interface TransactionItem<T> {
  raw?: T,
  action: string,
  amount: Coin,
  timestamp: string,
  status: "success" | "failure" | undefined;
}

export function fromCoin(coin: any & Coin): Coin {
  return {
    amount: coin?.amount || "",
    denom: coin?.denom || ""
  }
}

interface MsgSend {
  cosmos: {
    from_address: string;
    amount: Coin[];
  }
}

interface MsgDelegate {
  cosmos: {
    from_address: string;
    amount: Coin;
    delegator_address: string;
    validator_address: string;
  }
}

interface MsgUndelegate {
  cosmos: {
    amount: Coin;
    delegator_address: string;
    validator_address: string;
  }
}

interface MsgBeginRedelegate {
  cosmos: {
    amount: Coin;
    delegator_address: string;
    validator_dst_address: string;
    validator_src_address: string;
  }
}

interface MsgWithdrawDelegatorReward {
  cosmos: {
    delegator_address: string;
    validator_address: string;
  }
}

export function toUiItem(intl, bech32Address: string, txResponse: TxResponse): TransactionItem<TxResponse> {
  let msgs = txResponse?.tx?.body?.messages || [];
  let msgRaw = firstOrNull(msgs)

  let type: string = msgRaw ? msgRaw["@type"] || msgRaw["typeUrl"] || null : null;

  let action = type || "";
  let amount = fromCoin(null);
  var status: TransactionItem<TxResponse>["status"] = txResponse?.code === 0 ? "success" : "failure";

  const getAmountFromRawLog = (rawLog: string, eventType: "withdraw_rewards" | "coinbase") => {
    const logs = JSON.parse(rawLog) as {
      events: {
        type: string,
        attributes: {
          key: string,
          value: string
        }[]
      }[]
    }[];

    const amounts = logs.flatMap((log) => {
      return log.events.filter((event) => {
        return event.type === eventType
      }).flatMap((event) => {
        return event.attributes.filter((att) => {
          return att.key === "amount"
        }).flatMap((att) => {
          const value = att.value as string;
          const index = value.search(/[^0-9]/g);

          return {
            amount: value.substring(0, index),
            denom: value.substring(index, value.length),
          };
        });
      });
    }) as Coin[];

    if (amounts) {
      return amounts.reduce((prev, cur) => {
        return {
          amount: (Number(prev.amount) + Number(cur.amount)).toString(),
          denom: cur.denom
        }
      }, fromCoin({}));
    }

    return fromCoin({});
  }

  switch (type) {
    case "/cosmos.bank.v1beta1.MsgSend": {
      const msg = (msgRaw as unknown) as MsgSend["cosmos"];
      action = msg.from_address === bech32Address ? "sender" : "receiver"
      action = intl.formatMessage({ id: `history.action.MsgSend.${action}` })
      let coin = firstOrNull(msg.amount);
      amount = fromCoin(coin)
      break;
    }
    // case "/cosmos.bank.v1beta1.MsgMultiSend": {
    //     let input = firstOrNull(msgRaw.inputs);
    //     let output = firstOrNull(msgRaw.outputs);
    //     let isSender = input ? bech32Address === input.address : bech32Address != output.address;
    //     action = isSender ? "sender" : "receiver"
    //     action = intl.formatMessage({ id: `history.action.MsgMultiSend.${action}` })
    //     let coin = firstOrNull(input ? input.coins : output.coins);
    //     amount = fromCoin(coin)
    //     break;
    // } 
    case "/cosmos.staking.v1beta1.MsgDelegate": {
      const msg = (msgRaw as unknown) as MsgDelegate["cosmos"];
      action = msg.delegator_address === bech32Address ? "sender" : "receiver"
      action = intl.formatMessage({ id: `history.action.MsgDelegate.${action}` })
      amount = fromCoin(msg.amount)
      break;
    }
    case "/cosmos.staking.v1beta1.MsgBeginRedelegate": {
      const msg = (msgRaw as unknown) as MsgBeginRedelegate["cosmos"];
      action = msg.delegator_address === bech32Address ? "sender" : "receiver"
      action = intl.formatMessage({ id: `history.action.MsgBeginRedelegate.${action}` })
      amount = fromCoin(msg.amount)
      break;
    }
    case "/cosmos.staking.v1beta1.MsgUndelegate": {
      const msg = (msgRaw as unknown) as MsgUndelegate["cosmos"];
      action = msg.delegator_address === bech32Address ? "sender" : "receiver"
      action = intl.formatMessage({ id: `history.action.MsgUndelegate.${action}` })
      amount = fromCoin(msg.amount)
      break;
    }
    case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
      const msg = (msgRaw as unknown) as MsgWithdrawDelegatorReward["cosmos"];
      action = msg.delegator_address === bech32Address ? "sender" : "receiver"
      action = intl.formatMessage({ id: `history.action.MsgWithdrawDelegatorReward.${action}` })
      amount = getAmountFromRawLog(txResponse?.raw_log, "withdraw_rewards");
      break;
    }
    case "/ethermint.evm.v1.MsgEthereumTx":
      action = intl.formatMessage({ id: "history.action.swap" });
      amount = getAmountFromRawLog(txResponse?.raw_log, "coinbase");
      break;
    case undefined:
    case null:
    default: {
      console.log(type)
      action = intl.formatMessage({ id: "history.action.notsupport" })
      status = undefined;
      break;
    }
  }

  return {
    raw: txResponse,
    timestamp: txResponse.timestamp,
    action,
    status,
    amount,
  }
}

export function firstOrNull<T extends any>(arr: T[]): T | null { return (arr?.length || 0) !== 0 ? arr[0] : null; }