import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, QueriesSetBase } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { ObservableQueryEVMTokenInfo } from "./axelar";
import {
  ObservableQueryERC20Balance,
  ObservableQueryERC20Metadata,
} from "./erc20";

export interface KeplrETCQueries {
  keplrETC: KeplrETCQueriesImpl;
}

export const KeplrETCQueries = {
  use(options: {
    ethereumURL: string;
  }): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => KeplrETCQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        keplrETC: new KeplrETCQueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter,
          options.ethereumURL
        ),
      };
    };
  },
};

export class KeplrETCQueriesImpl {
  public readonly queryERC20Metadata: DeepReadonly<ObservableQueryERC20Metadata>;
  public readonly queryEVMTokenInfo: DeepReadonly<ObservableQueryEVMTokenInfo>;
  public readonly queryERC20Balance: DeepReadonly<ObservableQueryERC20Balance>;

  constructor(
    _base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    ethereumURL: string
  ) {
    this.queryERC20Metadata = new ObservableQueryERC20Metadata(
      kvStore,
      ethereumURL
    );
    this.queryEVMTokenInfo = new ObservableQueryEVMTokenInfo(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryERC20Balance = new ObservableQueryERC20Balance(
      kvStore,
      ethereumURL
    );
  }
}
