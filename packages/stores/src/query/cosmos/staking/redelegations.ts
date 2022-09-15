import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Redelegation, Redelegations } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

export class ObservableQueryRedelegationsInner extends ObservableChainQuery<Redelegations> {
  protected bech32Address: string;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/staking/v1beta1/delegators/${bech32Address}/redelegations`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  @computed
  get redelegations(): Redelegation[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.redelegation_responses;
  }

  readonly getRedelegations = computedFn(
    (params: {
      srcValidatorAddress?: string,
      dstValidatorAddress?: string,
    } = {}): Redelegation[] => {
      const { srcValidatorAddress: src = "", dstValidatorAddress: dst = "" } = params;

      const redelegations = this.redelegations.filter((redelegation) => {
        var condition = true;
        condition = condition && (src.length !== 0 ? redelegation.redelegation.validator_src_address === src : true);
        condition = condition && (dst.length !== 0 ? redelegation.redelegation.validator_dst_address === dst : true);
        return condition;
      });

      return redelegations;
    }
  );
}

export class ObservableQueryRedelegations extends ObservableChainQueryMap<Redelegations> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryRedelegationsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableQueryRedelegationsInner {
    return this.get(bech32Address) as ObservableQueryRedelegationsInner;
  }
}
