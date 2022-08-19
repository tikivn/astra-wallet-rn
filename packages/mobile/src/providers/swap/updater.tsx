import { useEffect, useMemo, useRef } from "react";
import { CancelledError, retry, RetryableError } from "./retry";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Contract } from "web3-eth-contract";

import Web3 from "web3";
import { SwapRootState } from ".";
import MulticallAbi from "../../contracts/abis/Multicall.json";
import { ADDRESSES } from "../../contracts/addresses";
import { useDebounce, useWeb3 } from "../../hooks";
import { getContract } from "../../utils/for-swap";
import { Call, parseCallKey } from "./actions";
import { chunkArray } from "./chunk-array";
import { SwapType } from "./reducer";
import { useDataSwapContext } from "./use-data-swap-context";

// chunk calls so we do not exceed the gas limit
const CALL_CHUNK_SIZE = 500;

/**
 * Fetches a chunk of calls, enforcing a minimum block number constraint
 * @param multicallContract multicall contract to fetch against
 * @param chunk chunk of calls to make
 * @param minBlockNumber minimum block number of the result set
 */
async function fetchChunk(
  multicallContract: Contract,
  chunk: Call[],
  minBlockNumber: number
): Promise<{ results: string[]; blockNumber: number }> {
  let resultsBlockNumber;
  let returnData;
  try {
    // prettier-ignore
    const result = await multicallContract.methods.aggregate(
      chunk.map((obj) => [obj.address, obj.callData])
    ).call({
      defaultBlock: minBlockNumber,
    })
    resultsBlockNumber = Web3.utils.toNumber(result.blockNumber);
    returnData = result.returnData;
    console.log("call data");
  } catch (err) {
    const error = err as any;
    if (
      error.code === -32000 ||
      (error?.data?.message &&
        error?.data?.message?.indexOf("header not found") !== -1) ||
      error.message?.indexOf("header not found") !== -1
    ) {
      throw new RetryableError(
        `header not found for block number ${minBlockNumber}`
      );
    } else if (
      error.code === -32603 ||
      error.message?.indexOf("execution ran out of gas") !== -1
    ) {
      if (chunk.length > 1) {
        if (process.env.NODE_ENV === "development") {
          console.debug("Splitting a chunk in 2", chunk);
        }
        const half = Math.floor(chunk.length / 2);
        const [c0, c1] = await Promise.all([
          fetchChunk(multicallContract, chunk.slice(0, half), minBlockNumber),
          fetchChunk(
            multicallContract,
            chunk.slice(half, chunk.length),
            minBlockNumber
          ),
        ]);
        return {
          results: c0.results.concat(c1.results),
          blockNumber: c1.blockNumber,
        };
      }
    }
    console.debug("Failed to fetch chunk inside retry", error);
    throw error;
  }
  if (resultsBlockNumber < minBlockNumber) {
    console.debug(
      `Fetched results for old block number: ${resultsBlockNumber.toString()} vs. ${minBlockNumber}`
    );
  }
  return { results: returnData, blockNumber: resultsBlockNumber };
}

/**
 * From the current all listeners state, return each call key mapped to the
 * minimum number of blocks per fetch. This is how often each key must be fetched.
 * @param allListeners the all listeners state
 * @param chainId the current chain id
 */
export function activeListeningKeys(
  allListeners: SwapRootState["multicalls"]["callListeners"],
  chainId?: number
): { [callKey: string]: number } {
  if (!allListeners || !chainId) return {};
  const listeners = allListeners[chainId];
  if (!listeners) return {};

  return Object.keys(listeners).reduce<{ [callKey: string]: number }>(
    (memo, callKey) => {
      const keyListeners = listeners[callKey];

      memo[callKey] = Object.keys(keyListeners)
        .filter((key) => {
          const blocksPerFetch = parseInt(key);
          if (blocksPerFetch <= 0) return false;
          return keyListeners[blocksPerFetch] > 0;
        })
        .reduce((previousMin, current) => {
          return Math.min(previousMin, parseInt(current));
        }, Infinity);
      return memo;
    },
    {}
  );
}

/**
 * Return the keys that need to be refetched
 * @param callResults current call result state
 * @param listeningKeys each call key mapped to how old the data can be in blocks
 * @param chainId the current chain id
 * @param currentBlock the latest block number
 */
export function outdatedListeningKeys(
  callResults: SwapRootState["multicalls"]["callResults"],
  listeningKeys: { [callKey: string]: number },
  chainId: number | undefined,
  currentBlock: number | undefined
): string[] {
  if (!chainId || !currentBlock) return [];
  const results = callResults[chainId];
  // no results at all, load everything
  if (!results) return Object.keys(listeningKeys);

  return Object.keys(listeningKeys).filter((callKey) => {
    const blocksPerFetch = listeningKeys[callKey];

    const data = callResults[chainId][callKey];
    // no data, must fetch
    if (!data) return true;

    const minDataBlockNumber = currentBlock - (blocksPerFetch - 1);

    // already fetching it for a recent enough block, don't refetch it
    if (
      data.fetchingBlockNumber &&
      data.fetchingBlockNumber >= minDataBlockNumber
    )
      return false;

    // if data is older than minDataBlockNumber, fetch it
    return !data.blockNumber || data.blockNumber < minDataBlockNumber;
  });
}
export function getMulticallContract(chainId: number, web3: Web3) {
  return getContract(MulticallAbi as any, ADDRESSES.Multicall[chainId], web3);
}
export function Updater() {
  const { dispatch, stores } = useDataSwapContext();
  const { chainId, web3Instance, currentBlockNumber } = useWeb3();
  const state = stores.multicalls;
  // wait for listeners to settle before triggering updates
  const debouncedListeners = useDebounce(state.callListeners, 100);
  const currentBlock = currentBlockNumber ?? 0;
  const multicallContract = getMulticallContract(
    chainId as number,
    web3Instance as Web3
  );
  const cancellations = useRef<{
    blockNumber: number;
    cancellations: (() => void)[];
  }>();

  const listeningKeys: { [callKey: string]: number } = useMemo(() => {
    return activeListeningKeys(debouncedListeners, chainId);
  }, [debouncedListeners, chainId]);

  const unserializedOutdatedCallKeys = useMemo(() => {
    return outdatedListeningKeys(
      state.callResults,
      listeningKeys,
      chainId,
      currentBlock
    );
  }, [chainId, state.callResults, listeningKeys, currentBlock]);

  const serializedOutdatedCallKeys = useMemo(
    () => JSON.stringify(unserializedOutdatedCallKeys.sort()),
    [unserializedOutdatedCallKeys]
  );

  useEffect(() => {
    if (!currentBlock || !chainId || !multicallContract || !dispatch) return;

    const outdatedCallKeys: string[] = JSON.parse(serializedOutdatedCallKeys);
    if (outdatedCallKeys.length === 0) return;
    const calls = outdatedCallKeys.map((key) => parseCallKey(key));

    const chunkedCalls = chunkArray(calls, CALL_CHUNK_SIZE);

    if (cancellations.current?.blockNumber !== currentBlock) {
      cancellations.current?.cancellations?.forEach((c) => c());
    }

    dispatch({
      type: SwapType.FETCH_MULTICALL_RESULTS,
      payload: { calls, chainId, fetchingBlockNumber: currentBlock },
    });

    cancellations.current = {
      blockNumber: currentBlock,
      cancellations: chunkedCalls.map((chunk, index) => {
        const { cancel, promise } = retry(
          () => fetchChunk(multicallContract, chunk, currentBlock),
          {
            n: Infinity,
            minWait: 2500,
            maxWait: 3500,
          }
        );
        promise
          .then(({ results: returnData, blockNumber: fetchBlockNumber }) => {
            cancellations.current = {
              cancellations: [],
              blockNumber: currentBlock,
            };

            // accumulates the length of all previous indices
            const firstCallKeyIndex = chunkedCalls
              .slice(0, index)
              .reduce<number>((memo, curr) => memo + curr.length, 0);
            const lastCallKeyIndex = firstCallKeyIndex + returnData.length;
            dispatch({
              type: SwapType.UPDATE_MULTICALL_RESULTS,
              payload: {
                chainId,
                results: outdatedCallKeys
                  .slice(firstCallKeyIndex, lastCallKeyIndex)
                  .reduce<{ [callKey: string]: string | null }>(
                    (memo, callKey, i) => {
                      memo[callKey] = returnData[i] ?? null;
                      return memo;
                    },
                    {}
                  ),
                blockNumber: fetchBlockNumber,
              },
            });
          })
          .catch((error: any) => {
            if (error instanceof CancelledError) {
              console.debug("Cancelled fetch for blockNumber", currentBlock);
              return;
            }
            console.error(
              "Failed to fetch multicall chunk",
              chunk,
              chainId,
              error
            );
            dispatch &&
              dispatch({
                type: SwapType.EROR_FETCH_MULTICALL_RESULTS,
                payload: {
                  calls: chunk,
                  chainId,
                  fetchingBlockNumber: currentBlock,
                },
              });
          });
        return cancel;
      }),
    };
  }, [
    chainId,
    multicallContract,
    dispatch,
    serializedOutdatedCallKeys,
    currentBlock,
  ]);

  return null;
}
