import { CoinPretty } from "@keplr-wallet/unit";
import { useStore } from "..";

export class UserBalanceStore {
  constructor() { }

  getBalance(chainId?: string): CoinPretty {
    const { chainStore, accountStore, queriesStore } = useStore();
    const selectedChainId = chainId ?? chainStore.current.chainId;

    const account = accountStore.getAccount(selectedChainId);
    const queries = queriesStore.get(selectedChainId);

    const queryStakable = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    ).stakable;

    return queryStakable.balance;
  }

  getBalanceString(chainId?: string): string {
    return this.getBalance(chainId)
      .trim(true)
      .shrink(true)
      .maxDecimals(6)
      .upperCase(true)
      .toString();
  }

  getRewards(chainId?: string): CoinPretty {
    const { chainStore, accountStore, queriesStore } = useStore();
    const selectedChainId = chainId ?? chainStore.current.chainId;

    const account = accountStore.getAccount(selectedChainId);
    const queries = queriesStore.get(selectedChainId);

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
