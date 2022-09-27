import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Allowance } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
// import { computedFn } from "mobx-utils";

export class ObservableQueryAllowanceInner extends ObservableChainQuery<Allowance> {
  protected queryPath: string;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    queryPath: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/feegrant/v1beta1/allowance/${queryPath}`
    );
    makeObservable(this);

    this.queryPath = queryPath;
  }

  @computed
  get allowance(): Allowance | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data;
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

export class ObservableQueryAllowance extends ObservableChainQueryMap<Allowance> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (queryPath: string) => {
      return new ObservableQueryAllowanceInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        queryPath
      );
    });
  }

  getGranteeBech32Address(
    granter: string,
    grantee: string
  ): ObservableQueryAllowanceInner {
    return this.get(`${granter}/${grantee}`) as ObservableQueryAllowanceInner;
  }
}
