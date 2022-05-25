import { CoinPretty } from "@keplr-wallet/unit";
import { useStore } from "..";

export class UserBalanceStore {
  constructor() { }

  getbalance(chainId?: string): CoinPretty {
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
    return this.getbalance(chainId)
      .trim(true)
      .shrink(true)
      .maxDecimals(6)
      .upperCase(true)
      // .hideDenom(true)
      .toString();
  }
}
