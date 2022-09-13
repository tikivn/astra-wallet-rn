import { isAddress } from "@ethersproject/address";
import { Provider, Web3Provider } from "@ethersproject/providers";
import {
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
} from "@solarswap/sdk";
import { useCallback, useMemo, useState } from "react";
import erc20Abi from "../contracts/abis/erc20.json";
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
    return new TokenAmount(WASA, asaBalance);
  }, [asaBalance, WASA]);
};
