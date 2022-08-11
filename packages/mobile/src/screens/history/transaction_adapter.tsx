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
    status: string
}

export function fromCoin(coin: any & Coin): Coin {
    return {
        amount: coin?.amount || "",
        denom: coin?.denom || ""
    }
}

export function toUiItem(intl, bech32Address: string, txResponse: TxResponse): TransactionItem<TxResponse> {
    let msgs = txResponse?.tx?.body?.messages || [];
    let msgRaw = firstOrNull(msgs)
    
    let type: string = msgRaw ? msgRaw["@type"] || msgRaw["typeUrl"] || null : null;
    
    let action = type || "";
    let amount = fromCoin(null);
    let status = "";
    switch (type) {
        case undefined: 
        case null: break;
        case "/cosmos.bank.v1beta1.MsgSend": {
            action = msgRaw.from_address === bech32Address ? "sender" : "receiver"
            action = intl.formatMessage({ id: `history.action.MsgSend.${action}` })
            let coin = firstOrNull(msgRaw.amount);
            amount = fromCoin(coin)
            // TODO check status 
            status = intl.formatMessage({ id: "history.status.success" })
            break;
        }
        case "/cosmos.bank.v1beta1.MsgMultiSend": {
            let input = firstOrNull(msgRaw.inputs);
            let output = firstOrNull(msgRaw.outputs);
            let isSender = input ? bech32Address === input.address : bech32Address != output.address;
            action = isSender ? "sender" : "receiver"
            action = intl.formatMessage({ id: `history.action.MsgMultiSend.${action}` })
            let coin = firstOrNull(input ? input.coins : output.coins);
            amount = fromCoin(coin)
            // TODO check status 
            status = intl.formatMessage({ id: "history.status.success" })
            break;
        } 
        case "/cosmos.staking.v1beta1.MsgDelegate": {
            action = msgRaw.delegator_address === bech32Address ? "sender" : "receiver"
            action = intl.formatMessage({ id: `history.action.MsgDelegate.${action}` })
            amount = fromCoin(msgRaw.amount)
            // TODO check status 
            status = intl.formatMessage({ id: "history.status.success" })
            break;
        }
        case "/cosmos.staking.v1beta1.MsgBeginRedelegate": {
            action = msgRaw.delegator_address === bech32Address ? "sender" : "receiver"
            action = intl.formatMessage({ id: `history.action.MsgBeginRedelegate.${action}` })
            amount = fromCoin(msgRaw.amount)
            // TODO check status 
            status = intl.formatMessage({ id: "history.status.success" })
            break;
        }
        case "/cosmos.staking.v1beta1.MsgUndelegate": {
            action = msgRaw.delegator_address === bech32Address ? "sender" : "receiver"
            action = intl.formatMessage({ id: `history.action.MsgUndelegate.${action}` })
            amount = fromCoin(msgRaw.amount)
            // TODO check status 
            status = intl.formatMessage({ id: "history.status.success" })
            break;
        }
        case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
            action = msgRaw.delegator_address === bech32Address ? "sender" : "receiver"
            action = intl.formatMessage({ id: `history.action.MsgWithdrawDelegatorReward.${action}` })
            // TODO check status 
            status = intl.formatMessage({ id: "history.status.success" })
            break;
        }
        default: { 
            action = intl.formatMessage({ id: "history.action.notsupport" })
            // TODO check status 
            status = intl.formatMessage({ id: "history.status.unknown" })
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