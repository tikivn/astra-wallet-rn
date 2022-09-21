import { parseUnits } from "@ethersproject/units";
import { CurrencyAmount, JSBI, Trade } from "@solarswap/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SwapAction, SwapInfoState, SwapType } from "../providers/swap/reducer";
import {
  calculateSlippagePercent,
  ERROR_KEY,
  FIXED_DECIMAL_PLACES,
  MAXIMUM_PRICE_IMPACT,
  SIGNIFICANT_DECIMAL_PLACES,
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
  minimunReceived?: string | undefined;
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
  ] = useState<UseSwapAggregationValue>({
    lpFee: "",
    pricePerInputCurrency: "",
    minimunReceived: "",
    priceImpact: "",
    trade: undefined,
    isReadyToSwap: false,
  });

  const calculateValue = useCallback(
    (trade: Trade) => {
      const { inputAmount, outputAmount } = trade;
      const pricePerInputCurrency =
        independentField === SwapField.Output
          ? outputAmount.divide(inputAmount).toSignificant(FIXED_DECIMAL_PLACES)
          : inputAmount
              .divide(outputAmount)
              .toSignificant(SIGNIFICANT_DECIMAL_PLACES);
      const outputSwapValue =
        independentField === SwapField.Output
          ? outputAmount.toSignificant(SIGNIFICANT_DECIMAL_PLACES)
          : inputAmount.toSignificant(SIGNIFICANT_DECIMAL_PLACES);
      const {
        realizedLPFee,
        priceImpactWithoutFee,
      } = computeTradePriceBreakdown(trade);
      const minimunReceived = trade
        .minimumAmountOut(calculateSlippagePercent(slippageTolerance))
        .toSignificant(FIXED_DECIMAL_PLACES);
      const isPriceImpactTooHigh = priceImpactWithoutFee?.greaterThan(
        MAXIMUM_PRICE_IMPACT
      );

      setOutputSwapValue(outputSwapValue);
      setAggregationValue({
        lpFee: realizedLPFee?.toSignificant(SIGNIFICANT_DECIMAL_PLACES) || "",
        priceImpact:
          priceImpactWithoutFee?.toSignificant(SIGNIFICANT_DECIMAL_PLACES) ||
          "",
        trade,
        minimunReceived,
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
      const parseInput = parseUnits(
        inputValue,
        balance?.currency?.decimals
      ).toString();
      const isTrue = JSBI.lessThanOrEqual(JSBI.BigInt(parseInput), balance.raw);
      if (!isTrue) {
        error = ERROR_KEY.INSUFFICIENT_BALANCE;
      }
    } catch (err) {
      console.error("Error when input value", { err });
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
