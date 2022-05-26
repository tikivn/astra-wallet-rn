import { Tx } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";

export interface Pagination {
    offset: string,
    limit: string,
    count_total: boolean,
}

export type Txs = {
    txs: Tx[];
    tx_responses: TxResponse[]
};

export type TxResponse = {
    txhash: string,
    height: string,
    data: string, 
    gas_wanted: string,
    gas_used: string,
    tx: Tx,
    timestamp: string, 
}