import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Grant, Grants } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
// import { computedFn } from "mobx-utils";

export class ObservableQueryGrantsInner extends ObservableChainQuery<Grants> {
  protected queryParams: string;

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
      `/cosmos/authz/v1beta1/grants?${queryParams}`
    );
    makeObservable(this);

    this.queryParams = queryParams;
  }

  @computed
  get grants(): Grant[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.grants;
  }

  // readonly getGrants = computedFn(
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

export class ObservableQueryGrants extends ObservableChainQueryMap<Grants> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
  ) {
    super(kvStore, chainId, chainGetter, (queryParams: string) => {
      return new ObservableQueryGrantsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        queryParams
      );
    });
  }

  getGranterBech32Address(
    bech32Address: string
  ): ObservableQueryGrantsInner {
    return this.get(`granter=${bech32Address}`) as ObservableQueryGrantsInner;
  }

  getGranteeBech32Address(
    bech32Address: string
  ): ObservableQueryGrantsInner {
    return this.get(`grantee=${bech32Address}`) as ObservableQueryGrantsInner;
  }
}
