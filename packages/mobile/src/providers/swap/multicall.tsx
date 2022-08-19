import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import BN from "bn.js";
import { useWeb3 } from "../../hooks/use-web3";
import { Call, ListenerOptions, parseCallKey, toCallKey } from "./actions";
import { useDataSwapContext } from "./use-data-swap-context";
import { SwapType } from "./reducer";
import { encodeFunctionCall } from "../../utils/for-swap";
import { KeyCache, useCache } from "../../hooks";
import Web3 from "web3";
import { getMulticallContract } from "./updater";
import { ChainId } from "@solarswap/sdk";
// import { Contract } from "web3-eth-contract";

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any;
}

type MethodArg = string | number | BN;
type MethodArgs = Array<MethodArg | MethodArg[]>;

type OptionalMethodInputs =
  | Array<MethodArg | MethodArg[] | undefined>
  | undefined;

function isMethodArg(x: unknown): x is MethodArg {
  return ["string", "number"].indexOf(typeof x) !== -1;
}

function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) &&
      x.every(
        (xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))
      ))
  );
}

interface CallResult {
  readonly valid: boolean;
  readonly data: string | undefined;
  readonly blockNumber: number | undefined;
}

const INVALID_RESULT: CallResult = {
  valid: false,
  blockNumber: undefined,
  data: undefined,
};

// use this options object
export const NEVER_RELOAD: ListenerOptions = {
  blocksPerFetch: Infinity,
};

// the lowest level call for subscribing to contract data
function useCallsData(
  calls: (Call | undefined)[],
  chainId: number,
  options?: ListenerOptions
): CallResult[] {
  const { stores, dispatch } = useDataSwapContext();
  const callResults = stores.multicalls.callResults;

  const serializedCallKeys: string = useMemo(
    () =>
      JSON.stringify(
        calls
          ?.filter((c): c is Call => Boolean(c))
          ?.map(toCallKey)
          ?.sort() ?? []
      ),
    [calls]
  );

  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys: string[] = JSON.parse(serializedCallKeys);
    if (!chainId || callKeys.length === 0) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const calls = callKeys.map((key) => parseCallKey(key));
    dispatch &&
      dispatch({
        type: SwapType.ADD_MULTICALL_LISTENERS,
        payload: { chainId, calls, options },
      });

    return () => {
      dispatch &&
        dispatch({
          type: SwapType.REMOVE_MULTICALL_LISTENERS,
          payload: { chainId, calls, options },
        });
    };
  }, [chainId, dispatch, options, serializedCallKeys]);

  return useMemo(
    () =>
      calls.map<CallResult>((call) => {
        if (!chainId || !call) return INVALID_RESULT;

        const result = callResults[chainId]?.[toCallKey(call)];
        let data;
        if (result?.data && result?.data !== "0x") {
          // eslint-disable-next-line prefer-destructuring
          data = result.data;
        }

        return { valid: true, data, blockNumber: result?.blockNumber };
      }),
    [callResults, calls, chainId]
  );
}

interface CallState {
  readonly valid: boolean;
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined;
  // true if the result has never been fetched
  readonly loading: boolean;
  // true if the result is not for the latest block
  readonly syncing: boolean;
  // true if the call was made and is synced, but the return data is invalid
  readonly error: boolean;
}

const INVALID_CALL_STATE: CallState = {
  valid: false,
  result: undefined,
  loading: false,
  syncing: false,
  error: false,
};
const LOADING_CALL_STATE: CallState = {
  valid: true,
  result: undefined,
  loading: true,
  syncing: true,
  error: false,
};

function toCallState(
  callResult: CallResult | undefined,
  web3: Web3 | undefined,
  typeOutputs: string[] | undefined
): CallState {
  if (!callResult) return INVALID_CALL_STATE;
  const { valid, data, blockNumber } = callResult;
  if (!valid) return INVALID_CALL_STATE;
  if (valid && !blockNumber) return LOADING_CALL_STATE;
  if (!web3) return LOADING_CALL_STATE;
  const success = data && data.length > 2;
  const syncing = blockNumber !== 0;
  let result: Result | undefined;
  if (success && data) {
    try {
      result = web3.eth.abi.decodeParameters(typeOutputs || [], data) as Result;
    } catch (error) {
      console.debug("Result data parsing failed", data, error);
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      };
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result,
    error: !success,
  };
}

// export function useSingleContractMultipleData(
//   abis: any[],
//   methodName: string,
//   callInputs: OptionalMethodInputs[],
//   options?: ListenerOptions
// ): CallState[] {
//   const { chainId, web3Instance, currentBlockNumber } = useWeb3();
//   if (!web3Instance || !chainId || !currentBlockNumber) {
//     return [];
//   }
//   const { callData, typeOutputs } = encodeFunctionCall(
//     abis,
//     methodName,
//     callInputs,
//     web3Instance
//   );
//   const calls = useMemo(
//     () =>
//       callInputs && callInputs.length > 0
//         ? callInputs.map<Call>((inputs) => {
//             return {
//               address: contract.address,
//               callData: contract.interface.encodeFunctionData(fragment, inputs),
//             };
//           })
//         : [],
//     [callInputs]
//   );

//   const results = useCallsData(calls, options);

//   const { cache } = useSWRConfig();

//   return useMemo(() => {
//     const currentBlockNumber = cache.get("blockNumber");
//     return results.map((result) =>
//       toCallState(result, contract?.interface, fragment, currentBlockNumber)
//     );
//   }, [fragment, contract, results, cache]);
// }

export function useMultipleContractSingleData(
  addresses: (string | undefined)[],
  abi: any,
  methodName: string,
  callInputs?: OptionalMethodInputs,
  options?: ListenerOptions
) {
  const { chainId, web3Instance } = useWeb3();
  const callData = useMemo(() => {
    if (!web3Instance || !isValidMethodArgs(callInputs)) {
      return undefined;
    }
    const { callData: calls, typeOutputs: types } = encodeFunctionCall(
      abi,
      methodName,
      callInputs,
      web3Instance
    );
    return { calls, types };
  }, [abi, callInputs, methodName, web3Instance]);

  const calls = useMemo(
    () =>
      addresses && addresses.length > 0 && callData
        ? addresses.map<Call | undefined>((address) => {
            return address && callData.calls
              ? {
                  address,
                  callData: callData.calls,
                }
              : undefined;
          })
        : [],
    [addresses, callData]
  );

  const results = useCallsData(calls, chainId || 0, options);

  return useMemo(() => {
    return results.map((result) =>
      toCallState(result, web3Instance, callData?.types)
    );
  }, [callData, results, web3Instance]);
}

// export function useSingleCallResult(
//   contract: Contract | null | undefined,
//   methodName: string,
//   inputs?: OptionalMethodInputs,
//   options?: ListenerOptions
// ): CallState {
//   const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [
//     contract,
//     methodName,
//   ]);

//   const calls = useMemo<Call[]>(() => {
//     return contract && fragment && isValidMethodArgs(inputs)
//       ? [
//           {
//             address: contract.address,
//             callData: contract.interface.encodeFunctionData(fragment, inputs),
//           },
//         ]
//       : [];
//   }, [contract, fragment, inputs]);

//   const result = useCallsData(calls, options)[0];
//   const { cache } = useSWRConfig();

//   return useMemo(() => {
//     const currentBlockNumber = cache.get("blockNumber");
//     return toCallState(
//       result,
//       contract?.interface,
//       fragment,
//       currentBlockNumber
//     );
//   }, [cache, result, contract?.interface, fragment]);
// }
export interface CallProps {
  methodName: string;
  inputs: string[] | string;
  target: string;
}
export const multicall = async (
  abi: any[],
  calls: CallProps[],
  web3Instance: Web3,
  chainId: number
) => {
  const typeOutputs: (string[] | undefined)[] = [];
  const contract = getMulticallContract(
    chainId || ChainId.TESTNET,
    web3Instance
  );

  const calldata = calls.map((call) => {
    const { callData, typeOutputs: types } = encodeFunctionCall(
      abi,
      call.methodName,
      call.inputs,
      web3Instance
    );
    typeOutputs.push(types || []);
    return {
      target: call.target.toLowerCase(),
      callData,
    };
  });
  if (!contract) {
    return;
  }
  const { returnData } = await contract.methods.aggregate(calldata).call();
  return (returnData as any[]).map(
    (data: any, i: number) =>
      web3Instance.eth.abi.decodeParameters(
        typeOutputs[i] || [],
        data
      ) as Result
  );
};
