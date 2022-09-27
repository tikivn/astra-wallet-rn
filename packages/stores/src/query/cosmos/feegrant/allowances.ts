import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Allowance, Allowances } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
// import { computedFn } from "mobx-utils";

export class ObservableQueryAllowancesInner extends ObservableChainQuery<Allowances> {
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
      `/cosmos/feegrant/v1beta1/allowances/${bech32Address}`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  @computed
  get allowances(): Allowance[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.allowances;
  }

  // readonly getRedelegations = computedFn(
  //   (params: {
  //     srcValidatorAddress?: string,
  //     dstValidatorAddress?: string,
  //   } = {}): Redelegation[] => {
  //     const { srcValidatorAddress: src = "", dstValidatorAddress: dst = "" } = params;

  //     const redelegations = this.redelegations.filter((redelegation) => {
  //       var condition = true;
  //       condition = condition && (src.length !== 0 ? redelegation.redelegation.validator_src_address === src : true);
  //       condition = condition && (dst.length !== 0 ? redelegation.redelegation.validator_dst_address === dst : true);
  //       return condition;
  //     });

  //     return redelegations;
  //   }
  // );
}

export class ObservableQueryAllowances extends ObservableChainQueryMap<Allowances> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryAllowancesInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getGranteeBech32Address(
    bech32Address: string
  ): ObservableQueryAllowancesInner {
    return this.get(bech32Address) as ObservableQueryAllowancesInner;
  }
}
