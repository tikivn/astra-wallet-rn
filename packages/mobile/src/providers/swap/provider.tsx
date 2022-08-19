import React, { FunctionComponent, useReducer } from "react";
import { initialSwapReducerValue, SwapContext, SwapProviderProps } from ".";
import { useAmountOut, useSwapInfo, useSwapState } from "../../hooks";
import { reducer } from "./reducer";

export const SwapProvider: FunctionComponent<SwapProviderProps> = ({
  children,
}) => {
  const [{ swapInfos }, dispatch] = useReducer(
    reducer,
    initialSwapReducerValue
  );

  const { tokenBalances } = useSwapInfo({
    indexCurrency: swapInfos.indexCurrency,
    dispatch,
  });

  const { fetchTrade } = useAmountOut({
    swapInfos,
  });

  const { values, ...aggregationValue } = useSwapState({
    fetchTrade,
    swapInfos,
    tokenBalances,
    dispatch,
  });

  if (!dispatch) return null;
  return (
    <SwapContext.Provider
      value={{
        swapInfos,
        dispatch,
        tokenBalances,
        values,
        ...aggregationValue,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};
