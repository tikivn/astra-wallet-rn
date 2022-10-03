import { isAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { Provider, Web3Provider } from "@ethersproject/providers";
import { Erc20Currency } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import {
  ChainId,
  Currency,
  CurrencyAmount,
  ETHER,
  JSBI,
  Token,
  TokenAmount,
} from "@solarswap/sdk";
import { useCallback, useMemo, useState } from "react";
import erc20Abi from "../contracts/abis/erc20.json";
import { useStore } from "../stores";
import { INTERNAL_DELAY } from "../utils/for-swap";
import { CallProps, multicall } from "../utils/for-swap/multicall";
import { useInterval } from "./use-interval";
import { useWeb3 } from "./use-web3";

export const useTokenBalances = (
  account: string,
  tokens: Token[],
  chainId: ChainId,
  provider: Provider
) => {
  const [balances, setBalances] = useState();
  const validTokens = useMemo(
    () => tokens.filter((token) => isAddress(token.address)),
    [tokens]
  );

  const tokenAddress = useMemo(
    () => validTokens.map((token) => token.address),
    [validTokens]
  );
  const calls: CallProps[] = tokenAddress.map((addr) => ({
    methodName: "balanceOf",
    target: addr,
    params: [account],
  }));

  useInterval(
    () => {
      (async () => {
        try {
          const bls = await multicall(erc20Abi, calls, chainId, provider);
          setBalances(bls as any);
        } catch (e: any) {
          console.error("Error fetch balances token:", { error: e });
        }
      })();
    },
    INTERNAL_DELAY,
    true
  );

  return useMemo(
    () =>
      account && validTokens.length > 0
        ? validTokens.reduce<{
            [tokenAddress: string]: TokenAmount | undefined;
          }>((memo, token, i) => {
            const value = balances?.[i]?.[0] || 0;
            const amount = value ? JSBI.BigInt(value) : undefined;
            if (amount) {
              memo[token.address] = new TokenAmount(token, amount);
            }
            return memo;
          }, {})
        : {},
    [account, validTokens, balances]
  );
};

export function useCurrencyBalances(
  currencies?: (Currency | undefined)[]
): (CurrencyAmount | undefined)[] {
  const { etherProvider, accountHex, chainId } = useWeb3();

  const tokens = useMemo(
    () =>
      currencies?.filter(
        (currency): currency is Token => currency?.symbol !== ETHER.symbol
      ) ?? [],
    [currencies]
  );

  const tokenBalances = useTokenBalances(
    accountHex,
    tokens,
    chainId ?? ChainId.TESTNET,
    etherProvider
  );
  const asaBalance = useASABalance(accountHex, etherProvider);
  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!accountHex || !currency) return undefined;
        if (currency.symbol === ETHER.symbol) return asaBalance;
        if (currency instanceof Token) return tokenBalances[currency.address];
        return undefined;
      }) ?? [],
    [accountHex, asaBalance, currencies, tokenBalances]
  );
}

export const useASABalance = (
  accountHex: string,
  etherProvider: Web3Provider
) => {
  const [asaBalance, setAsaBalance] = useState("");

  const getBalance = useCallback(() => {
    if (!etherProvider || !accountHex) return;

    etherProvider
      .getBalance(accountHex)
      .then((res) => setAsaBalance(res.toString()))
      .catch((err) => {
        console.log("ERROR_ASA_BALANCE: ", err);
      });
  }, [accountHex, etherProvider]);

  useInterval(
    () => {
      getBalance();
    },
    INTERNAL_DELAY,
    true
  );

  return useMemo(() => {
    return asaBalance ? CurrencyAmount.ether(asaBalance) : undefined;
  }, [asaBalance]);
};

export function useCurrencyBalancesFromStore(
  balances: (CurrencyAmount | undefined)[],
  currencies: (Currency | undefined)[]
) {
  const { queriesStore, chainStore, accountStore } = useStore();
  const chainIdStr = chainStore.current.chainId;
  const account = accountStore.getAccount(chainStore.current.chainId);
  const asaBalance = useCallback(() => {
    const queryBalances = queriesStore
      .get(chainIdStr)
      .queryBalances.getQueryBech32Address(account.bech32Address);
    const balance = queryBalances.getBalanceFromCurrency(
      chainStore.current.currencies[0]
    );
    return CurrencyAmount.ether(balance.toCoin().amount);
  }, [account.bech32Address, chainIdStr, chainStore, queriesStore]);

  const getBalanceErc20 = useCallback(
    (token: Token) => {
      if (!account.ethereumHexAddress || !token.address) return undefined;
      const balance = queriesStore
        .get(chainIdStr)
        .keplrETC.queryERC20Balance.getBalance({
          contractAddress: token.address,
          accountHex: account.ethereumHexAddress,
        }).balance;
      if (!balance) {
        return new TokenAmount(token, 0);
      }
      const bn = BigNumber.from(balance);
      return new TokenAmount(token, bn.toString());
    },
    [account.ethereumHexAddress, chainIdStr, queriesStore]
  );

  return useMemo(() => {
    if (balances && balances.every((f) => f)) {
      return balances;
    }
    return currencies?.map((currency) => {
      if (!currency) return undefined;
      if (currency?.symbol === ETHER.symbol) return asaBalance();
      if (currency instanceof Token) return getBalanceErc20(currency);
      return undefined;
    });
  }, [asaBalance, balances, currencies, getBalanceErc20]);
}
