import { SwapRootState } from ".";
import { SwapField } from "../../utils/for-swap";

export interface SwapInfoState {
  indexCurrency: {
    [K in SwapField]: number;
  };
  dependentField: SwapField;
  independentField: SwapField;
  slippageTolerance: number;
  swapValue: string;
  error: string;
  loading: boolean;
}
export enum SwapType {
  REVERSE_TOKEN,
  SET_SLIPPAGE_TOLERANCE,
  SET_DEPENDENT_FIELD,
  SET_SWAP_VALUE,
  SET_TOKEN_BALANCES,
  SET_ERROR,
  SWAP_ALL,
  SET_LOADING,
}
export interface SwapAction {
  type: SwapType;
  payload?: any;
}

export const handleReverseToken = (rootState: SwapRootState) => {
  const state = rootState.swapInfos;
  const index = {
    [SwapField.Input]: state.indexCurrency[SwapField.Output],
    [SwapField.Output]: state.indexCurrency[SwapField.Input],
  };
  return {
    ...rootState,
    swapInfos: {
      ...rootState.swapInfos,
      indexCurrency: index,
      dependentField: state.independentField,
      independentField: state.dependentField,
    },
  };
};

export const handleSetSetSlippageTolarance = (
  rootState: SwapRootState,
  payload: number
) => {
  const swapInfos = rootState.swapInfos;
  if (payload !== swapInfos.slippageTolerance) {
    return {
      ...rootState,
      swapInfos: { ...rootState.swapInfos, slippageTolerance: payload },
    };
  }

  return rootState;
};

export const handleSetSwapValue = (
  rootState: SwapRootState,
  {
    value,
    dependentField,
    error,
  }: { value: string; dependentField: SwapField; error: string }
) => {
  const swapState = rootState.swapInfos;
  let swapInfos = {};
  if (swapState.dependentField !== dependentField) {
    const independentField =
      dependentField === SwapField.Input ? SwapField.Output : SwapField.Input;
    swapInfos = {
      independentField,
      dependentField,
    };
  }
  if (error) {
    swapInfos = { ...swapInfos, error };
  }
  return {
    ...rootState,
    swapInfos: { ...swapState, ...swapInfos, swapValue: value },
  };
};

export const handleSetError = (rootState: SwapRootState, error: string) => {
  rootState.swapInfos.error = error;
  return rootState;
};
export const handleSetLoading = (
  rootState: SwapRootState,
  loading: boolean
) => {
  rootState.swapInfos.loading = loading;
  return rootState;
};

export const reducer = (
  state: SwapRootState,
  action: SwapAction
): SwapRootState => {
  switch (action.type) {
    case SwapType.REVERSE_TOKEN:
      return handleReverseToken(state);
    case SwapType.SET_SLIPPAGE_TOLERANCE:
      return handleSetSetSlippageTolarance(state, action.payload as number);
    case SwapType.SET_SWAP_VALUE:
      return handleSetSwapValue(state, action.payload);
    case SwapType.SET_ERROR:
      return handleSetError(state, action.payload);
    case SwapType.SET_LOADING:
      return handleSetLoading(state, action.payload);
    default:
      return state;
  }
};
