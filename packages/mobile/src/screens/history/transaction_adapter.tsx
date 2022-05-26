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

export function toUiItem(bech32Address: string, txResponse: TxResponse): TransactionItem<TxResponse> {
    let msgs = txResponse.tx.body?.messages || [];
    let mode = firstOrNull(txResponse.tx.auth_info.signer_infos || [])?.mode_info?.single?.mode
    let isAmino = mode == "SIGN_MODE_LEGACY_AMINO_JSON";
    let msgRaw = firstOrNull(msgs)
    
    let type: string = msgRaw ? msgRaw["@type"] || msgRaw["typeUrl"] || null : null;
    
    console.log(`from: ${type} isAmino=${isAmino} mode=${mode}`);
    let action = type || "";
    let amount = fromCoin(null);
    let status = "";
    switch (type) {
        case undefined: 
        case null: break;
        case "/cosmos.bank.v1beta1.MsgSend": {
            action = msgRaw.from_address === bech32Address ? "Gửi" : "Nhận";
            let coin = firstOrNull(msgRaw.amount);
            amount = fromCoin(coin)
            // TODO check status 
            status = 'Thành công'
            break;
        }
        case "/cosmos.bank.v1beta1.MsgMultiSend": {
            let input = firstOrNull(msgRaw.inputs);
            let output = firstOrNull(msgRaw.outputs);
            console.log(`from: ${input?.address} ben=${bech32Address} ${bech32Address === input.address}`)
            let isSender = input ? bech32Address === input.address : bech32Address != output.address;
            action = isSender ? "Gửi theo nhóm" : "Nhận theo nhóm";
            
            let coin = firstOrNull(input ? input.coins : output.coins);
            amount = fromCoin(coin)
            // TODO check status 
            status = 'Thành công'
            break;
        } 
        case "/cosmos.staking.v1beta1.MsgDelegate": {
            action = msgRaw.delegator_address === bech32Address ? "Đầu tư" : "Nhận đầu tư";
            amount = fromCoin(msgRaw.amount)
            // TODO check status 
            status = 'Thành công'
            break;
        }
        case "/cosmos.staking.v1beta1.MsgBeginRedelegate": {
            action = msgRaw.delegator_address === bech32Address ? "Chuyển quỹ đầu tư" : "Nhận đầu tư";
            console.log(`from: ${msgRaw.amount?.amount} ben=${bech32Address} ${bech32Address === msgRaw.amount?.amount}`)
            amount = fromCoin(msgRaw.amount)
            // TODO check status 
            status = 'Thành công'
            break;
        }
        case "/cosmos.staking.v1beta1.MsgUndelegate": {
            action = msgRaw.delegator_address === bech32Address ? "Rút khỏi quỹ đầu tư" : "Bị rút đầu tư";
            amount = fromCoin(msgRaw.amount)
            // TODO check status 
            status = 'Thành công'
            break;
        }
        case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
            action = msgRaw.delegator_address === bech32Address ? "Rút thưởng về ví" : "Nhà đầu tư rút thưởng";
            // TODO check status 
            status = 'Thành công'
            break;
        }
        default: { 
            console.log(`type: ${type} not suppport yet`);
            action = "Chưa hỗ trợ"
            // TODO check status 
            status = 'Không xác định'
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