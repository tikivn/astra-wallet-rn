import { Interface, Result } from "@ethersproject/abi";
import { KVStore } from "@keplr-wallet/common";
import { HasMapStore, ObservableJsonRPCQuery } from "@keplr-wallet/stores";
import Axios from "axios";
import { computed, makeObservable } from "mobx";

const erc20BalanceInterface: Interface = new Interface([
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
]);

export class ObservableQueryERC20MetadataBalance extends ObservableJsonRPCQuery<string> {
  constructor(
    kvStore: KVStore,
    ethereumURL: string,
    contractAddress: string,
    accountHex: string
  ) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(
      kvStore,
      instance,
      "",
      "eth_call",
      [
        {
          to: contractAddress,
          data: erc20BalanceInterface.encodeFunctionData("balanceOf", [
            accountHex,
          ]),
          from: accountHex,
        },
        "latest",
      ],
      {
        cacheMaxAge: 10 * 1000,
        fetchingInterval: 10 * 1000,
      }
    );
    makeObservable(this);
  }

  @computed
  get balance(): Result | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      return erc20BalanceInterface.decodeFunctionResult(
        "balanceOf",
        this.response.data
      )[0];
    } catch (e: any) {
      console.log("Error when fetching balance ERC20", e);
    }
    return undefined;
  }
}

export class ObservableQueryERC20BalanceInner {
  protected readonly _queryBalance: ObservableQueryERC20MetadataBalance;

  constructor(
    kvStore: KVStore,
    ethereumURL: string,
    contractAddress: string,
    account: string
  ) {
    this._queryBalance = new ObservableQueryERC20MetadataBalance(
      kvStore,
      ethereumURL,
      contractAddress,
      account
    );
  }
  get balance(): Result | undefined {
    return this._queryBalance.balance;
  }
}
export type GetBalanceErc20Props = {
  contractAddress: string;
  accountHex: string;
};
export class ObservableQueryERC20Balance extends HasMapStore<ObservableQueryERC20BalanceInner> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly ethereumURL: string
  ) {
    super((key: string) => {
      const data = JSON.parse(key) as GetBalanceErc20Props;
      return new ObservableQueryERC20BalanceInner(
        this.kvStore,
        this.ethereumURL,
        data.contractAddress,
        data.accountHex
      );
    });
  }

  getBalance(data: GetBalanceErc20Props): ObservableQueryERC20BalanceInner {
    return this.get(JSON.stringify(data));
  }
}
