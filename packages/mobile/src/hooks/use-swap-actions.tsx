import { CurrencyAmount } from "@solarswap/sdk";
import { useCallback } from "react";
import { SwapAction, SwapType } from "../providers/swap/reducer";
import { maxAmountSpend, SwapField } from "../utils/for-swap";

interface UseSwapActionsProps {
  tokenBalances: {
    [Key in SwapField]: CurrencyAmount | undefined;
  };
  dispatch: React.Dispatch<SwapAction> | null;
}
export const useSwapActions = ({
  tokenBalances,
  dispatch,
}: UseSwapActionsProps) => {
  const handleSetSwapValue = useCallback(
    (value: string, field: SwapField) => {
      const balanceOfField = tokenBalances[field];
      if (!balanceOfField) {
        return;
      }
      if (!dispatch) {
        return;
      }
      dispatch({
        type: SwapType.SET_SWAP_VALUE,
        payload: {
          value: value || "",
          dependentField: field,
        },
      });
    },
    [dispatch, tokenBalances]
  );
  const handleUserInput = useCallback(
    (value: string, field: SwapField) => {
      handleSetSwapValue(value, field);
    },
    [handleSetSwapValue]
  );

  const handleSetSlippageTolerance = useCallback(
    (value) => {
      if (value && dispatch) {
        dispatch({ type: SwapType.SET_SLIPPAGE_TOLERANCE, payload: value });
      }
    },
    [dispatch]
  );

  const handleReverseCurrencies = useCallback(() => {
    dispatch && dispatch({ type: SwapType.REVERSE_TOKEN });
  }, [dispatch]);

  const handleSwapAll = useCallback(
    (field: SwapField = SwapField.Input) => {
      const amount = maxAmountSpend(tokenBalances[field])?.toExact();
      dispatch &&
        dispatch({
          type: SwapType.SET_SWAP_VALUE,
          payload: {
            value: amount || "",
            dependentField: field,
          },
        });
    },
    [dispatch, tokenBalances]
  );
  return {
    onUserInput: handleUserInput,
    onSetSlippageTolerance: handleSetSlippageTolerance,
    onReverseCurrencies: handleReverseCurrencies,
    onSwapAll: handleSwapAll,
  };
};
