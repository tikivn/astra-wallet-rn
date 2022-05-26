import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Pagination, Txs } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { makeObservable } from "mobx";


export class ObservableQueryTxsInner extends ObservableChainQuery<Txs> {
  protected queryParams: string;

  static createQuery = (
    bech32Address: string,
    isSender: boolean = true,
    pagination: Pagination | null = null
    
  ): string => {
    if (bech32Address.length > 0) {
      return `pagination.limit=${pagination?.limit || "100"}` +
      `&pagination.offset=${pagination?.offset || "0"}` +
      `&pagination.count_total=${pagination?.count_total || true}` +
      `&events=transfer.${isSender ? "sender" : "recipient"}%3D'${bech32Address}'`;
    }
    return ""
  }

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

  // @computed
  // get total(): CoinPretty {
  //   const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

  //   if (!this.response) {
  //     return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
  //   }

  //   let totalBalance = new Int(0);
  //   for (const delegation of this.response.data.delegation_responses) {
  //     totalBalance = totalBalance.add(new Int(delegation.balance.amount));
  //   }

  //   return new CoinPretty(stakeCurrency, totalBalance);
  // }

  // @computed
  // get delegationBalances(): {
  //   validatorAddress: string;
  //   balance: CoinPretty;
  // }[] {
  //   if (!this.response) {
  //     return [];
  //   }

  //   const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

  //   const result = [];

  //   for (const delegation of this.response.data.delegation_responses) {
  //     result.push({
  //       validatorAddress: delegation.delegation.validator_address,
  //       balance: new CoinPretty(
  //         stakeCurrency,
  //         new Int(delegation.balance.amount)
  //       ),
  //     });
  //   }

  //   return result;
  // }

  // @computed
  // get delegations(): Delegation[] {
  //   if (!this.response) {
  //     return [];
  //   }

  //   return this.response.data.delegation_responses;
  // }

  // readonly getDelegationTo = computedFn(
  //   (validatorAddress: string): CoinPretty => {
  //     const delegations = this.delegations;

  //     const stakeCurrency = this.chainGetter.getChain(this.chainId)
  //       .stakeCurrency;

  //     if (!this.response) {
  //       return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
  //     }

  //     for (const delegation of delegations) {
  //       if (delegation.delegation.validator_address === validatorAddress) {
  //         return new CoinPretty(
  //           stakeCurrency,
  //           new Int(delegation.balance.amount)
  //         );
  //       }
  //     }

  //     return new CoinPretty(stakeCurrency, new Int(0));
  //   }
  // );
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
    isSender:boolean = true,
    pagination: Pagination | null = null,
  ): ObservableQueryTxsInner {
    // TODO split case for cached sender or recipient
    let queryParams = ObservableQueryTxsInner.createQuery(bech32Address, isSender, pagination)
    return this.get(queryParams) as ObservableQueryTxsInner;
  }
}
