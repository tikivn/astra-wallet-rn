import { CW20Currency } from "@keplr-wallet/types";
import { useCallback, useEffect, useMemo } from "react";
import { useStore } from "../stores";
import {
  ChainId,
  Token,
  Fetcher,
  Route,
  Trade,
  TokenAmount,
  ETHER,
  CurrencyAmount,
} from "@astradefi/sdk";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3 } from "./use-web3";

export const useAmountOut = (
  tokenInIndex: number = 0,
  tokenOutIndex: number = 1
  // amountIn: number
) => {
  const { chainStore } = useStore();
  const { currencies } = chainStore.current;
  const { etherProvider, web3Instance } = useWeb3();

  // useEffect(() => {
  //   if (!web3Instance || !etherProvider || !xzcvzcxvzvxc) return;
  //   (async () => {
  //     const b = (await web3Instance.eth.net.getId()).toString();
  //     const a = await etherProvider.getNetwork();
  //     const c = await xzcvzcxvzvxc?.getNetwork();
  //     console.log("🚀 -> a", b, a, c);
  //   })();
  // }, [etherProvider, web3Instance, xzcvzcxvzvxc]);

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
