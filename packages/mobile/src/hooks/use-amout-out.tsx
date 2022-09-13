import {
  Currency,
  CurrencyAmount,
  ETHER,
  Fetcher,
  Pair,
  Token,
  Trade,
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
}: UseAmountOutProps) => {
  const { etherProvider, WASA } = useWeb3();
  const [pair, setPair] = useState<Pair>();

  const fetchPairData = useCallback(async () => {
    if (!etherProvider || !inputCurrency || !outputCurrency) return;
    console.log("Fetch Pair Data");
    const pairFetch = await Fetcher.fetchPairData(
      inputCurrency as Token,
      outputCurrency as Token,
      etherProvider
    );
    setPair(pairFetch);
  }, [etherProvider, inputCurrency, outputCurrency]);

  const trade = useCallback(
    async (valueSwap: string, dependentField: SwapField) => {
      if (!pair || !inputCurrency || !outputCurrency) return [];
      if (dependentField === SwapField.Input) {
        const tokenInAmoutSwap = tryParseAmount(valueSwap, inputCurrency, WASA);
        return Trade.bestTradeExactIn(
          [pair],
          tokenInAmoutSwap as CurrencyAmount,
          outputCurrency.symbol === ETHER.symbol ? ETHER : outputCurrency
        );
      }
      const tokenOutAmoutSwap = tryParseAmount(valueSwap, outputCurrency, WASA);
      return Trade.bestTradeExactOut(
        [pair],
        inputCurrency.symbol === ETHER.symbol ? ETHER : inputCurrency,
        tokenOutAmoutSwap as CurrencyAmount
      );
    },
    [WASA, pair, inputCurrency, outputCurrency]
  );
  useInterval(
    () => {
      fetchPairData();
    },
    INTERNAL_DELAY,
    true
  );

  return {
    fetchTrade: trade,
  };
};
