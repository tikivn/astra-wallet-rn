import { Currency, CurrencyAmount } from "@solarswap/sdk";
import React from "react";
import { UseSwapAggregationValue } from "../../hooks";
import { INITIAL_ALLOWED_SLIPPAGE, SwapField } from "../../utils/for-swap";
import { SwapAction, SwapInfoState } from "./reducer";
export interface SwapRootState {
  swapInfos: SwapInfoState;
}
export interface SwapContextProps extends UseSwapAggregationValue {
  swapInfos: SwapInfoState;
  dispatch: React.Dispatch<SwapAction> | null;
  tokenBalances: {
    [K in SwapField]: CurrencyAmount | undefined;
  };
  values: {
    [K: string]: string;
  };

  currencies: {
    [K in SwapField]: Currency | undefined;
  };
}

export interface SwapProviderProps {
  children: React.ReactNode;
}

const swapInfos = {
  indexCurrency: {
    [SwapField.Input]: 0,
    [SwapField.Output]: 1,
  },
  dependentField: SwapField.Input,
  independentField: SwapField.Output,
  slippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  swapValue: "",
  error: "",
  loading: false,
};
export const initialSwapReducerValue: SwapRootState = {
  swapInfos,
};

export const SwapContext = React.createContext<SwapContextProps>({
  swapInfos: initialSwapReducerValue.swapInfos,
  dispatch: null,
  tokenBalances: {
    [SwapField.Input]: undefined,
    [SwapField.Output]: undefined,
  },
  values: {
    [SwapField.Input]: "",
    [SwapField.Output]: "",
  },
  currencies: {
    [SwapField.Input]: undefined,
    [SwapField.Output]: undefined,
  },
  lpFee: "",
  pricePerInputCurrency: "",
  minimunReceived: "",
  priceImpact: "",
  trade: undefined,
  isReadyToSwap: false,
});
