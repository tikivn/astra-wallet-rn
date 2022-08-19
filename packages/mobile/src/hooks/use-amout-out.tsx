import { CurrencyAmount, Fetcher, Pair, Token, Trade } from "@solarswap/sdk";
import { useCallback, useState } from "react";
import { SwapInfoState } from "../providers/swap/reducer";
import { INTERNAL_DELAY, SwapField } from "../utils/for-swap";
import { tryParseAmount } from "../utils/for-swap/try-parse-amount";
import { useInterval } from "./use-interval";
import { useWeb3 } from "./use-web3";

interface UseAmountOutProps {
  swapInfos: SwapInfoState;
}
export const useAmountOut = ({ swapInfos }: UseAmountOutProps) => {
  const { etherProvider, WASA } = useWeb3();
  const [pair, setPair] = useState<Pair>();
  const {
    currencies: {
      [SwapField.Input]: inputCurrency,
      [SwapField.Output]: outputCurrency,
    },
    swapValue,
  } = swapInfos;

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
          outputCurrency
        );
      }
      const tokenOutAmoutSwap = tryParseAmount(valueSwap, outputCurrency, WASA);
      return Trade.bestTradeExactOut(
        [pair],
        inputCurrency,
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
    true,
    swapValue
  );

  return {
    fetchTrade: trade,
  };
};
