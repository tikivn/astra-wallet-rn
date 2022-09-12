import { Interface, Result } from "@ethersproject/abi";
import { KVStore } from "@keplr-wallet/common";
import { HasMapStore, ObservableJsonRPCQuery } from "@keplr-wallet/stores";
import Axios from "axios";
import { action, makeObservable } from "mobx";

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
  constructor(kvStore: KVStore, ethereumURL: string) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(kvStore, instance, "", "eth_call", []);
    makeObservable(this);
  }

  @action
  async balance(
    contractAddress: string,
    accountHex: string
  ): Promise<Result | undefined> {
    this.setParams([
      {
        to: contractAddress,
        data: erc20BalanceInterface.encodeFunctionData("balanceOf", [
          accountHex,
        ]),
        from: accountHex,
      },
      "latest",
    ]);
    let response = await this.waitFreshResponse();
    if (!response) {
      response = await this.waitResponse();
    }
    if (!response) {
      return undefined;
    }

    try {
      return erc20BalanceInterface.decodeFunctionResult(
        "balanceOf",
        response.data
      )[0];
    } catch (e: any) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryERC20BalanceInner {
  protected readonly _queryBalance: ObservableQueryERC20MetadataBalance;

  constructor(kvStore: KVStore, ethereumURL: string) {
    this._queryBalance = new ObservableQueryERC20MetadataBalance(
      kvStore,
      ethereumURL
    );
  }
  async balance(
    contractAddress: string,
    accountHex: string
  ): Promise<any | undefined> {
    return this._queryBalance.balance(contractAddress, accountHex);
  }
}

export class ObservableQueryERC20Balance extends HasMapStore<ObservableQueryERC20BalanceInner> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly ethereumURL: string
  ) {
    super(() => {
      return new ObservableQueryERC20BalanceInner(
        this.kvStore,
        this.ethereumURL
      );
    });
  }

  get(): ObservableQueryERC20BalanceInner {
    const key = "get-balance";
    return super.get(key);
  }
}
