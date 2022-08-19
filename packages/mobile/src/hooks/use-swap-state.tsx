import { CurrencyAmount, Fraction, Trade } from "@solarswap/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SwapAction, SwapInfoState, SwapType } from "../providers/swap/reducer";
import {
  calculateSlippagePercent,
  ERROR_KEY,
  FIXED_DECIMAL_PLACES,
  isValueLessThanOrEqualBalance,
  SwapField,
  TIME_DEBOUNCE,
} from "../utils/for-swap";
import { computeTradePriceBreakdown } from "../utils/for-swap/compute-price";
import { useDebounce } from "./use-debounce";

interface UseSwapProps {
  fetchTrade: (
    valueSwap: string,
    dependentField: SwapField
  ) => Promise<Trade[] | undefined>;
  swapInfos: SwapInfoState;
  tokenBalances: {
    [Key in SwapField]: CurrencyAmount | undefined;
  };
  dispatch: React.Dispatch<SwapAction> | null;
}
export interface UseSwapAggregationValue {
  lpFee?: string | undefined;
  pricePerInputCurrency?: string | undefined;
  maximumReceived?: string | undefined;
  priceImpact?: string | undefined;
  trade?: Trade | undefined;
  isReadyToSwap: boolean;
}

export const useSwapState = ({
  fetchTrade,
  swapInfos,
  tokenBalances,
  dispatch,
}: UseSwapProps) => {
  const [outputSwapValue, setOutputSwapValue] = useState<string>("");
  const {
    dependentField,
    independentField,
    slippageTolerance,
    swapValue,
  } = useMemo(() => swapInfos, [swapInfos]);

  const debouncedSwapValue = useDebounce(swapValue, TIME_DEBOUNCE);

  const [
    aggregationValue,
    setAggregationValue,
  ] = useState<UseSwapAggregationValue>();

  const calculateValue = useCallback(
    (trade: Trade) => {
      const { inputAmount, outputAmount } = trade;
      const pricePerInputCurrency =
        independentField === SwapField.Output
          ? outputAmount.divide(inputAmount).toFixed(FIXED_DECIMAL_PLACES)
          : inputAmount.divide(outputAmount).toFixed(FIXED_DECIMAL_PLACES);
      const outputSwapValue =
        independentField === SwapField.Output
          ? outputAmount.toFixed(FIXED_DECIMAL_PLACES)
          : inputAmount.toFixed(FIXED_DECIMAL_PLACES);
      const {
        realizedLPFee,
        priceImpactWithoutFee,
      } = computeTradePriceBreakdown(trade);
      const maximumReceived = trade
        .minimumAmountOut(calculateSlippagePercent(slippageTolerance))
        .toSignificant(6);
      const isPriceImpactTooHigh = priceImpactWithoutFee?.greaterThan(
        new Fraction(15, 100)
      );

      setOutputSwapValue(outputSwapValue);
      setAggregationValue({
        lpFee: realizedLPFee?.toSignificant(6) || "",
        priceImpact: priceImpactWithoutFee?.toSignificant(6) || "",
        trade,
        maximumReceived,
        pricePerInputCurrency,
        isReadyToSwap: !isPriceImpactTooHigh,
      });
    },
    [independentField, slippageTolerance]
  );

  const getOutputValue = useCallback(async () => {
    if (
      debouncedSwapValue &&
      dependentField &&
      typeof fetchTrade !== undefined
    ) {
      const trades = await fetchTrade(debouncedSwapValue, dependentField);
      if (trades && trades.length > 0) {
        return calculateValue(trades[0]);
      }
    } else {
      setOutputSwapValue("");
    }
  }, [debouncedSwapValue, dependentField, fetchTrade, calculateValue]);

  const values = useMemo(
    () => ({
      [dependentField]: swapValue,
      [independentField]: outputSwapValue,
    }),
    [dependentField, independentField, outputSwapValue, swapValue]
  );

  useEffect(() => {
    const get = async () => {
      await getOutputValue();
    };
    get();
  }, [debouncedSwapValue, dependentField, getOutputValue]);

  useEffect(() => {
    // check insufficient balance
    const inputValue = values[SwapField.Input];
    const balance = tokenBalances[SwapField.Input];
    if (!balance || !inputValue || !dispatch) return;
    let error = "";
    try {
      const isTrue = isValueLessThanOrEqualBalance(
        inputValue,
        balance,
        balance?.currency.decimals
      );
      if (!isTrue) {
        error = ERROR_KEY.INSUFFICIENT_BALANCE;
      }
    } catch (err) {
      error = ERROR_KEY.INVALID_INPUT;
    }

    dispatch({
      type: SwapType.SET_ERROR,
      payload: error,
    });
  }, [dispatch, tokenBalances, values]);

  return {
    values,
    ...aggregationValue,
  };
};
