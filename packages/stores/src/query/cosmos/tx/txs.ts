import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Pagination, TxResponse, Txs } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";

export class ObservableQueryTxsInner extends ObservableChainQuery<Txs> {
  protected queryParams: string;

  static createQuery = (
    bech32Address: string,
    isSender: boolean = true,
    pagination: Pagination | null = null
  ): string => {
    if (bech32Address.length > 0) {
      return (
        `pagination.limit=${pagination?.limit || "100"}` +
        `&pagination.offset=${pagination?.offset || "0"}` +
        `&pagination.count_total=${pagination?.count_total || true}` +
        `&order_by=ORDER_BY_DESC` +
        `&events=transfer.${
          isSender ? "sender" : "recipient"
        }%3D'${bech32Address}'`
      );
    }
    return "";
  };

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    queryParams: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/tx/v1beta1/txs?${queryParams}`
    );
    makeObservable(this);

    this.queryParams = queryParams;
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.queryParams.length > 0;
  }

  @computed
  get txResponses(): TxResponse[] {
    return !this.response ? [] : this.response.data.tx_responses;
  }

  @computed
  get total(): number {
    return !this.response ? 0 : this.response.data.pagination.total || 0;
  }
}

export class ObservableQueryTxs extends ObservableChainQueryMap<Txs> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (queryParams: string) => {
      return new ObservableQueryTxsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        queryParams
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string,
    isSender: boolean = true,
    pagination: Pagination | null = null
  ): ObservableQueryTxsInner {
    // TODO split case for cached sender or recipient
    const queryParams = ObservableQueryTxsInner.createQuery(
      bech32Address,
      isSender,
      pagination
    );
    return this.get(queryParams) as ObservableQueryTxsInner;
  }
}
