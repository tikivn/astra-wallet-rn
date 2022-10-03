import {
  Currency,
  CurrencyAmount,
  ETHER,
  Fetcher,
  Pair,
  Token,
  Trade,
  WETH,
} from "@solarswap/sdk";
import { useCallback, useState } from "react";
import { INTERNAL_DELAY, SwapField } from "../utils/for-swap";
import { tryParseAmount } from "../utils/for-swap/try-parse-amount";
import { useInterval } from "./use-interval";
import { useWeb3 } from "./use-web3";

interface UseAmountOutProps {
  currencies: {
    [Key in SwapField]: Currency | undefined;
  };
  swapValue: string;
}
export const useAmountOut = ({
  currencies: {
    [SwapField.Input]: inputCurrency,
    [SwapField.Output]: outputCurrency,
  },
  swapValue,
}: UseAmountOutProps) => {
  const { etherProvider, chainId } = useWeb3();
  const [pair, setPair] = useState<Pair>();

  const fetchPairData = useCallback(async () => {
    if (!etherProvider || !inputCurrency || !outputCurrency) return;
    console.log("Fetch Pair Data");
    const input =
      inputCurrency.symbol === ETHER.symbol
        ? WETH[chainId]
        : (inputCurrency as Token);
    const output =
      outputCurrency.symbol === ETHER.symbol
        ? WETH[chainId]
        : (outputCurrency as Token);
    const pairFetch = await Fetcher.fetchPairData(input, output, etherProvider);
    setPair(pairFetch);
  }, [chainId, etherProvider, inputCurrency, outputCurrency]);

  const trade = useCallback(
    async (valueSwap: string, dependentField: SwapField) => {
      if (!pair || !inputCurrency || !outputCurrency) return [];
      if (dependentField === SwapField.Input) {
        const tokenInAmoutSwap = tryParseAmount(valueSwap, inputCurrency);
        return Trade.bestTradeExactIn(
          [pair],
          tokenInAmoutSwap as CurrencyAmount,
          outputCurrency
        );
      }
      const tokenOutAmoutSwap = tryParseAmount(valueSwap, outputCurrency);
      return Trade.bestTradeExactOut(
        [pair],
        inputCurrency,
        tokenOutAmoutSwap as CurrencyAmount
      );
    },
    [pair, inputCurrency, outputCurrency]
  );
  useInterval(
    () => {
      fetchPairData();
    },
    INTERNAL_DELAY,
    true,
    swapValue
  );
  return {
    fetchTrade: trade,
    pairData: pair,
  };
};
