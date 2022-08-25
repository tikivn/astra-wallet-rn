import {
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
} from "@solarswap/sdk";
import { useCallback, useMemo, useState } from "react";
import Web3 from "web3";
import erc20Abi from "../contracts/abis/erc20.json";
import { CallProps, multicall } from "../providers/swap/multicall";
import { INTERNAL_DELAY } from "../utils/for-swap";
import { useInterval } from "./use-interval";
import { useWeb3 } from "./use-web3";

export const useTokenBalances = (
  account: string,
  tokens: Token[],
  web3Instance: Web3,
  chainId: number
) => {
  const [balances, setBalances] = useState();
  const validTokens = useMemo(
    () => tokens.filter((token) => Web3.utils.isAddress(token.address)),
    [tokens]
  );

  const tokenAddress = useMemo(
    () => validTokens.map((token) => token.address),
    [validTokens]
  );
  const calls: CallProps[] = tokenAddress.map((addr) => ({
    methodName: "balanceOf",
    target: addr,
    inputs: [account],
  }));

  useInterval(
    () => {
      (async () => {
        const bls = await multicall(erc20Abi, calls, web3Instance, chainId);
        setBalances(bls as any);
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
  const { web3Instance, accountHex, WASA, chainId } = useWeb3();

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
    web3Instance,
    chainId ?? ChainId.TESTNET
  );
  const asaBalance = useASABalance(accountHex, web3Instance, WASA);
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

// export function useCurrencyBalance(
//   account?: string,
//   currency?: Currency
// ): CurrencyAmount | undefined {
//   return useCurrencyBalances(account, [currency])[0];
// }
export const useASABalance = (
  accountHex: string,
  web3Instance: Web3,
  WASA: Token
) => {
  const [asaBalance, setAsaBalance] = useState("");

  const getBalance = useCallback(() => {
    if (!web3Instance || !accountHex) return;

    web3Instance.eth
      .getBalance(accountHex)
      .then(setAsaBalance)
      .catch((err) => {
        console.log("ERROR_ASA_BALANCE: ", err);
      });
  }, [accountHex, web3Instance]);

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
