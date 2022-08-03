import { ChainId, CurrencyAmount, Fetcher, Token, Trade } from "@astradefi/sdk";
import { CW20Currency } from "@keplr-wallet/types";
import { useCallback, useMemo } from "react";
import { useStore } from "../stores";
import { useWeb3 } from "./use-web3";

export const useAmountOut = (
  tokenInIndex: number = 0,
  tokenOutIndex: number = 1
  // amountIn: number
) => {
  const { chainStore } = useStore();
  const { currencies } = chainStore.current;
  const { etherProvider } = useWeb3();
  const tokenIn = useMemo(() => {
    const token = currencies[tokenInIndex] as CW20Currency;

    return new Token(
      ChainId.TESTNET,
      "0x4fDC1FB9C36c855316bA66aAF2dc34aEfd680533",
      token.coinDecimals,
      token.coinDenom,
      token.coinMinimalDenom
    );
  }, [currencies, tokenInIndex]);

  const tokenOut = useMemo(() => {
    const token = currencies[tokenOutIndex] as CW20Currency;
    if (!token)
      return new Token(
        ChainId.TESTNET,
        "0x4fDC1FB9C36c855316bA66aAF2dc34aEfd680533",
        18
      );
    return new Token(
      ChainId.TESTNET,
      token.contractAddress,
      token.coinDecimals
    );
  }, [currencies, tokenOutIndex]);

  const fetchPairData = useCallback(async () => {
    if (!etherProvider) return;
    return await Fetcher.fetchPairData(tokenIn, tokenOut, etherProvider);
  }, [tokenIn, tokenOut, etherProvider]);

  const trade = useCallback(
    async (value: number) => {
      const pair = await fetchPairData();
      if (!pair) return;
      const trade = Trade.bestTradeExactIn(
        [pair],
        // new TokenAmount(tokenIn as Token, value * 1e18),,
        CurrencyAmount.ether(value * 1e18),
        tokenOut
      );
      return trade;
    },
    [fetchPairData, tokenOut]
  );

  return {
    fetchPairData,
    trade,
  };
};
