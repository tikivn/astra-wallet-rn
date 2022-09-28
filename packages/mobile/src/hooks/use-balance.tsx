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
  const { etherProvider, accountHex, WASA, chainId } = useWeb3();

  const tokens = useMemo(
    () =>
      currencies?.filter(
        (currency): currency is Token => currency?.symbol !== WASA.symbol
      ) ?? [],
    [WASA, currencies]
  );

  const tokenBalances = useTokenBalances(
    accountHex,
    tokens,
    chainId ?? ChainId.TESTNET,
    etherProvider
  );
  const asaBalance = useASABalance(accountHex, etherProvider, WASA);
  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!accountHex || !currency) return undefined;
        if (currency.symbol === WASA.symbol) return asaBalance;
        if (currency instanceof Token) return tokenBalances[currency.address];
        return undefined;
      }) ?? [],
    [WASA.symbol, accountHex, asaBalance, currencies, tokenBalances]
  );
}

export const useASABalance = (
  accountHex: string,
  etherProvider: Web3Provider,
  WASA: Token
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
    return asaBalance ? new TokenAmount(WASA, asaBalance) : undefined;
  }, [asaBalance, WASA]);
};

export function useCurrencyBalancesFromStore(
  currencies?: (Currency | undefined)[]
): (CurrencyAmount | undefined)[] {
  const { queriesStore, chainStore } = useStore();
  const { account, chainIdStr, accountHex } = useWeb3();
  const currencySymbols = useMemo(
    () => (currencies ? currencies.map((item) => item?.symbol) : []),
    [currencies]
  );

  const appCurrencies = useMemo(
    () =>
      chainStore.current.currencies.filter(
        (item) => item.coinDenom in currencySymbols
      ),
    [chainStore, currencySymbols]
  );
  const getBalanceErc20 = useCallback(
    (currency: Erc20Currency) => {
      const value0 = BigNumber.from(0).toString();
      if (!accountHex || !currency.contractAddress) return value0;
      const balance = queriesStore
        .get(chainIdStr)
        .keplrETC.queryERC20Balance.getBalance({
          contractAddress: currency.contractAddress,
          accountHex,
        }).balance;
      if (!balance) {
        return value0;
      }
      const bn = BigNumber.from(balance);
      return bn.toString();
    },
    [accountHex, chainIdStr, queriesStore]
  );
  const tokenBalances = useMemo(
    () =>
      appCurrencies.map((curr) => {
        const currency = currencies?.find((f) => f?.symbol === curr.coinDenom);

        if ("type" in curr && curr.type === "erc20") {
          return new TokenAmount(currency as Token, getBalanceErc20(curr));
        }
        if (curr.coinDenom === ETHER.symbol) {
          const asaBalance = queriesStore
            .get(chainIdStr)
            .queryBalances.getQueryBech32Address(account.bech32Address)
            .getBalanceFromCurrency(curr);
          return new TokenAmount(currency as Token, asaBalance.toString());
        }
      }),
    [
      account.bech32Address,
      appCurrencies,
      chainIdStr,
      currencies,
      getBalanceErc20,
      queriesStore,
    ]
  );
  console.log("🚀 -> tokenBalances", tokenBalances);

  return tokenBalances;
}
