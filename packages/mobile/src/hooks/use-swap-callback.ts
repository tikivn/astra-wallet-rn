import { Interface } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import {
  ChainId,
  Router,
  SwapParameters,
  Trade,
  TradeType,
} from "@solarswap/sdk";
import { useEffect, useMemo, useState } from "react";
import ISolardexRouter02ABI from "../contracts/abis/ISolardexRouter02.json";
import {
  calculateGasMargin,
  calculateSlippagePercent,
  isZero,
  TX_DEADLINE,
} from "../utils/for-swap";
import addresses from "../utils/for-swap/addresses";
import { getContract } from "../utils/for-swap/contract-helper";
import {
  DELAY_TRANSACTIONFEE,
  INITIAL_ALLOWED_SLIPPAGE,
} from "./../utils/for-swap/constant";
import { useDebounce } from "./use-debounce";
import { useSignTransaction } from "./use-sign-transaction";
import { useWeb3 } from "./use-web3";

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  intf: Interface;
  contract: Contract;
  parameters: SwapParameters;
  accountHex: string;
}

interface SuccessfulCall extends SwapCallEstimate {
  gasEstimate: BigNumber;
}

interface FailedCall extends SwapCallEstimate {
  error: string;
}

interface SwapCallEstimate {
  encodeFunctionData?: string;
  value?: string;
  gasEstimate?: BigNumber;
  error?: any;
}

function useTransactionDeadline() {
  const { etherProvider } = useWeb3();
  const [timestamp, setTimestamp] = useState<number>();
  useEffect(() => {
    if (!etherProvider) return;
    (async () => {
      const blockNumber = await etherProvider.getBlockNumber();
      const number = await etherProvider.getBlock(blockNumber);
      setTimestamp(+number.timestamp + TX_DEADLINE);
    })();
  }, [etherProvider]);
  return timestamp;
}
// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade

export function useSwapCallArguments(
  tradeMustDebounce: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  isUseDebounce = false
): SwapCall[] {
  const { accountHex, chainId, etherProvider: library } = useWeb3();
  const trade = useDebounce(
    tradeMustDebounce,
    isUseDebounce ? DELAY_TRANSACTIONFEE : 0
  );

  const chain = chainId || ChainId.TESTNET;

  const deadline = useTransactionDeadline();
  return useMemo(() => {
    if (!trade || !library || !accountHex || !chainId || !deadline) return [];

    const intfContract = new Interface(ISolardexRouter02ABI);
    const contract = getContract(
      ISolardexRouter02ABI,
      addresses.ROUTER[chain],
      library
    );
    if (!intfContract || !contract) {
      return [];
    }
    const swapMethods = [];
    const allowedSlippagePercent = calculateSlippagePercent(allowedSlippage);
    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: allowedSlippagePercent,
        recipient: accountHex,
        deadline,
      })
    );

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: allowedSlippagePercent,
          recipient: accountHex,
          deadline,
        })
      );
    }

    return swapMethods.map((parameters) => ({
      parameters,
      contract,
      intf: intfContract,
      accountHex,
    }));
  }, [accountHex, allowedSlippage, chain, chainId, deadline, library, trade]);
}

export async function swapEstimateGas(swapCalls: SwapCall[]) {
  const estimatedCalls: SwapCallEstimate[] = await Promise.all(
    swapCalls.map((call) => {
      const {
        parameters: { methodName, args, value },
        contract,
        intf,
        accountHex,
      } = call;

      const options = !value || isZero(value) ? {} : { value };
      const encodeFunctionData = intf.encodeFunctionData(methodName, args);
      const opts = { ...options, from: accountHex };
      return contract.estimateGas[methodName](...args, opts)
        .then((gasEstimate) => {
          return {
            encodeFunctionData,
            gasEstimate,
            value,
          };
        })
        .catch((gasError) => {
          console.error(
            "Gas estimate failed, trying eth_call to extract error",
            call,
            gasError
          );

          return contract.callStatic[methodName](...args, options)
            .then((result) => {
              console.error(
                "Unexpected successful call after failed estimate gas",
                call,
                gasError,
                result
              );
              return {
                call,
                error:
                  "Unexpected issue with estimating the gas. Please try again.",
              };
            })
            .catch((callError) => {
              console.error("Call threw error", call, callError);

              return {
                call,
                error: swapErrorToUserReadableMessage(callError),
              };
            });
        });
    })
  );

  // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
  const successfulEstimation = estimatedCalls.find(
    (el, ix, list): el is SuccessfulCall =>
      "gasEstimate" in el &&
      (ix === list.length - 1 || "gasEstimate" in list[ix + 1])
  );

  if (!successfulEstimation) {
    const errorCalls = estimatedCalls.filter(
      (call): call is FailedCall => "error" in call
    );
    if (errorCalls.length > 0)
      throw new Error(errorCalls[errorCalls.length - 1].error);
    throw new Error("Unexpected error. Could not estimate gas for the swap.");
  }

  return successfulEstimation;
}

export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE // in bips
  // recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): {
  state: SwapCallbackState;
  callback: null | (() => Promise<string>);
  error: string | null;
} {
  const { etherProvider: library, chainId, accountHex, getStore } = useWeb3();
  const { transactionStore } = getStore();
  const { signTransaction, signEthereum } = useSignTransaction();
  const swapCalls = useSwapCallArguments(trade, allowedSlippage);

  const recipient = accountHex;

  return useMemo(() => {
    if (!trade || !library || !accountHex || !chainId) {
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }
    if (!recipient || swapCalls.length === 0) {
      return { state: SwapCallbackState.LOADING, callback: null, error: null };
    }
    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        transactionStore.updateTxState("pending");

        const {
          encodeFunctionData,
          gasEstimate,
          value,
        } = await swapEstimateGas(swapCalls);

        return signEthereum(encodeFunctionData || "", {
          gas: calculateGasMargin(gasEstimate).toHexString(),
          value: value || "",
        })
          .then((hash) => {
            return hash;
          })
          .catch((error) => {
            console.error(
              `Swap failed: ${swapErrorToUserReadableMessage(error)}`
            );
            return "failed";
          });
      },
      error: null,
    };
  }, [
    trade,
    library,
    accountHex,
    chainId,
    recipient,
    transactionStore,
    swapCalls,
    signEthereum,
  ]);
}

/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 */
function swapErrorToUserReadableMessage(error: any) {
  let reason: string | undefined;
  while (error) {
    reason = error.reason ?? error.data?.message ?? error.message ?? reason;
    // eslint-disable-next-line no-param-reassign
    error = error.error ?? error.data?.originalError;
  }

  if (reason?.indexOf("execution reverted: ") === 0)
    reason = reason.substring("execution reverted: ".length);

  switch (reason) {
    case "PancakeRouter: EXPIRED":
      return "The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.";

    case "PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT":
    case "PancakeRouter: EXCESSIVE_INPUT_AMOUNT":
      return "This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.";

    case "TransferHelper: TRANSFER_FROM_FAILED":
      return "The input token cannot be transferred. There may be an issue with the input token.";

    case "Pancake: TRANSFER_FAILED":
      return "The output token cannot be transferred. There may be an issue with the output token.";

    default:
      if (reason?.indexOf("undefined is not an object") !== -1) {
        console.error(error, reason);
        return "An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading.";
      }
      return "Try increasing your slippage tolerance.";
  }
}
