import { Currency } from "@solarswap/sdk";
import { SwapField } from "../utils/for-swap";
import {
  useCurrencyBalances,
  useCurrencyBalancesFromStore,
} from "./use-balance";

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

  const balances = useCurrencyBalancesFromStore(relevantTokenBalances, [
    inputCurrency,
    outputCurrency,
  ]);

  const tokenBalances = {
    [SwapField.Input]: balances[0],
    [SwapField.Output]: balances[1],
  };
  return {
    tokenBalances,
  };
};
