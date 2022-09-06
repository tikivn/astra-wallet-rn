import {
  AccountStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  QueriesStore,
  SecretAccount,
  SecretQueries,
} from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { formatCoin } from "../../common/utils";
import { ChainStore } from "../chain";

export class UserBalanceStore {
  constructor(
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: AccountStore<
      [CosmosAccount, CosmwasmAccount, SecretAccount]
    >,
    protected readonly queriesStore: QueriesStore<
      [CosmosQueries, CosmwasmQueries, SecretQueries]
    >
  ) {}

  getBalance(chainId?: string): CoinPretty {
    const selectedChainId = chainId ?? this.chainStore.current.chainId;

    const account = this.accountStore.getAccount(selectedChainId);
    const queries = this.queriesStore.get(selectedChainId);

    const queryStakable = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    ).stakable;

    return queryStakable.balance;
  }

  getBalanceString(chainId?: string): string {
    const balance = this.getBalance(chainId);
    return formatCoin(balance);
  }

  getRewards(chainId?: string): CoinPretty {
    const selectedChainId = chainId ?? this.chainStore.current.chainId;

    const account = this.accountStore.getAccount(selectedChainId);
    const queries = this.queriesStore.get(selectedChainId);

    const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    );

    return queryReward.stakableReward;
  }

  getRewardsString(chainId?: string): string {
    return this.getRewards(chainId)
      .shrink(true)
      .maxDecimals(6)
      .trim(true)
      .upperCase(true)
      .toString();
  }
}
