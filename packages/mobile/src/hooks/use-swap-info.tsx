import { Currency } from "@solarswap/sdk";
import { SwapField } from "../utils/for-swap";
import { useCurrencyBalances } from "./use-balance";

interface UseSwapInfoProps {
  currencies: {
    [K in SwapField]: Currency | undefined;
  };
}

export const useSwapInfo = ({
  currencies: {
    [SwapField.Input]: inputCurrency,
    [SwapField.Output]: outputCurrency,
  },
}: UseSwapInfoProps) => {
  const relevantTokenBalances = useCurrencyBalances([
    inputCurrency,
    outputCurrency,
  ]);

  const tokenBalances = {
    [SwapField.Input]: relevantTokenBalances[0],
    [SwapField.Output]: relevantTokenBalances[1],
  };
  return {
    tokenBalances,
  };
};
