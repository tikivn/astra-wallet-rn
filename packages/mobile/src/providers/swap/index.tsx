import { Currency, CurrencyAmount } from "@solarswap/sdk";
import React from "react";
import { UseSwapAggregationValue } from "../../hooks";
import { SLIPPAGE_TOLERANCE, SwapField } from "../../utils/for-swap";
import { SwapAction, SwapInfoState } from "./reducer";
export interface SwapRootState {
  // multicalls: MulticallState;
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
// export const initialStateMulticalls: MulticallState = {
//   callResults: {},
// };

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
  slippageTolerance: SLIPPAGE_TOLERANCE[1],
  swapValue: "",
  error: "",
};
export const initialSwapReducerValue: SwapRootState = {
  // multicalls: initialStateMulticalls,
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
