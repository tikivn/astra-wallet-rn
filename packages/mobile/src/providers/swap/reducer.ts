import { Currency } from "@solarswap/sdk";
import { SwapRootState } from ".";
import { SwapField } from "../../utils/for-swap";

// export interface MulticallState {
//   callListeners?: {
//     // on a per-chain basis
//     [chainId: number]: {
//       // stores for each call key the listeners' preferences
//       [callKey: string]: {
//         // stores how many listeners there are per each blocks per fetch preference
//         [blocksPerFetch: number]: number;
//       };
//     };
//   };

//   callResults: {
//     [chainId: number]: {
//       [callKey: string]: {
//         data?: string | null;
//         blockNumber?: number;
//         fetchingBlockNumber?: number;
//       };
//     };
//   };
// }

export interface SwapInfoState {
  indexCurrency: {
    [K in SwapField]: number;
  };
  dependentField: SwapField;
  independentField: SwapField;
  slippageTolerance: number;
  swapValue: string;
  error: string;
  currencies: {
    [K in SwapField]: Currency | undefined;
  };
}
export enum SwapType {
  REVERSE_TOKEN,
  SET_SLIPPAGE_TOLERANCE,
  SET_DEPENDENT_FIELD,
  SET_SWAP_VALUE,
  SET_TOKEN_BALANCES,
  SET_ERROR,
  SET_CURRENCIES,
  SWAP_ALL,
}
// ADD_MULTICALL_LISTENERS = "ADD_MULTICALL_LISTENERS",
// REMOVE_MULTICALL_LISTENERS = "REMOVE_MULTICALL_LISTENERS",
// FETCH_MULTICALL_RESULTS = "FETCH_MULTICALL_RESULTS",
// EROR_FETCH_MULTICALL_RESULTS = "ERROR_FETCH_MULTICALL_RESULTS",
// UPDATE_MULTICALL_RESULTS = "UPDATE_MULTICALL_RESULTS",

export interface SwapAction {
  type: SwapType;
  payload?: any;
}
// const addMulticallListeners = (
//   rootState: SwapRootState,
//   action: SwapAction
// ) => {
//   const state = rootState.multicalls;
//   const {
//     payload: { calls, chainId, options: { blocksPerFetch = 1 } = {} },
//   } = action;
//   const listeners = state.callListeners
//     ? state.callListeners
//     : (state.callListeners = {});
//   listeners[chainId] = listeners[chainId] ?? {};
//   calls.forEach((call: Call) => {
//     const callKey = toCallKey(call);
//     listeners[chainId][callKey] = listeners[chainId][callKey] ?? {};
//     listeners[chainId][callKey][blocksPerFetch] =
//       (listeners[chainId][callKey][blocksPerFetch] ?? 0) + 1;
//   });
//   // return { ...rootState, multicalls: state };
//   return rootState;
// };

// const removeMulticallListeners = (
//   rootState: SwapRootState,
//   action: SwapAction
// ) => {
//   const state = rootState.multicalls;
//   const {
//     payload: { calls, chainId, options: { blocksPerFetch = 1 } = {} },
//   } = action;
//   const listeners: MulticallState["callListeners"] = state.callListeners
//     ? state.callListeners
//     : (state.callListeners = {});

//   if (!listeners[chainId]) return rootState;
//   calls.forEach((call: Call) => {
//     const callKey = toCallKey(call);
//     if (!listeners[chainId][callKey]) return;
//     if (!listeners[chainId][callKey][blocksPerFetch]) return;

//     if (listeners[chainId][callKey][blocksPerFetch] === 1) {
//       delete listeners[chainId][callKey][blocksPerFetch];
//     } else {
//       listeners[chainId][callKey][blocksPerFetch]--;
//     }
//   });
//   // return { ...rootState, multicalls: state };
//   return rootState;
// };

// const fetchingMulticallResults = (
//   rootState: SwapRootState,
//   action: SwapAction
// ) => {
//   const state = rootState.multicalls;
//   const {
//     payload: { chainId, fetchingBlockNumber, calls },
//   } = action;
//   state.callResults[chainId] = state.callResults[chainId] ?? {};
//   calls.forEach((call: Call) => {
//     const callKey = toCallKey(call);
//     const current = state.callResults[chainId][callKey];
//     if (!current) {
//       state.callResults[chainId][callKey] = {
//         fetchingBlockNumber,
//       };
//     } else {
//       if ((current.fetchingBlockNumber ?? 0) >= fetchingBlockNumber)
//         return rootState;
//       state.callResults[chainId][
//         callKey
//       ].fetchingBlockNumber = fetchingBlockNumber;
//     }
//   });
//   // return { ...rootState, multicalls: state };
//   return rootState;
// };

// const updateMulticallResults = (
//   rootState: SwapRootState,
//   action: SwapAction
// ) => {
//   const state = rootState.multicalls;
//   const {
//     payload: { chainId, results, blockNumber },
//   } = action;
//   state.callResults[chainId] = state.callResults[chainId] ?? {};
//   Object.keys(results).forEach((callKey) => {
//     const current = state.callResults[chainId][callKey];
//     if ((current?.blockNumber ?? 0) > blockNumber) return rootState;
//     state.callResults[chainId][callKey] = {
//       data: results[callKey],
//       blockNumber,
//     };
//   });
//   // return { ...rootState, multicalls: state };
//   return rootState;
// };

// const errorFetchingMulticallResults = (
//   rootState: SwapRootState,
//   action: SwapAction
// ) => {
//   const state = rootState.multicalls;
//   const {
//     payload: { fetchingBlockNumber, chainId, calls },
//   } = action;
//   state.callResults[chainId] = state.callResults[chainId] ?? {};
//   calls.forEach((call: Call) => {
//     const callKey = toCallKey(call);
//     const current = state.callResults[chainId][callKey];
//     if (!current) return; // only should be dispatched if we are already fetching
//     if (current.fetchingBlockNumber === fetchingBlockNumber) {
//       delete current.fetchingBlockNumber;
//       current.data = null;
//       current.blockNumber = fetchingBlockNumber;
//     }
//   });
//   // return { ...rootState, multicalls: state };
//   return rootState;
// };

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

export const handleSetCurrencies = (rootState: SwapRootState, payload: any) => {
  rootState.swapInfos.currencies = { ...payload };
  return rootState;
};

export const reducer = (
  state: SwapRootState,
  action: SwapAction
): SwapRootState => {
  switch (action.type) {
    // case SwapType.ADD_MULTICALL_LISTENERS:
    //   return addMulticallListeners(state, action);

    // case SwapType.REMOVE_MULTICALL_LISTENERS:
    //   return removeMulticallListeners(state, action);

    // case SwapType.FETCH_MULTICALL_RESULTS:
    //   return fetchingMulticallResults(state, action);

    // case SwapType.UPDATE_MULTICALL_RESULTS:
    //   return updateMulticallResults(state, action);

    // case SwapType.EROR_FETCH_MULTICALL_RESULTS:
    //   return errorFetchingMulticallResults(state, action);

    case SwapType.REVERSE_TOKEN:
      return handleReverseToken(state);
    case SwapType.SET_SLIPPAGE_TOLERANCE:
      return handleSetSetSlippageTolarance(state, action.payload as number);
    case SwapType.SET_SWAP_VALUE:
      return handleSetSwapValue(state, action.payload);
    case SwapType.SET_ERROR:
      return handleSetError(state, action.payload);
    case SwapType.SET_CURRENCIES:
      return handleSetCurrencies(state, action.payload);
    default:
      return state;
  }
};
