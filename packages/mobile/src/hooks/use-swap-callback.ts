import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";

import {
  ChainId,
  ETHER,
  JSBI,
  Percent,
  Router,
  SwapParameters,
  Trade,
  TradeType,
} from "@astradefi/sdk";
import { useEffect, useMemo, useState } from "react";
import IRouterPancakeABI from "../contracts/abis/IPancakeRouter02.json";
import {
  calculateGasMargin,
  GAS_PRICE_GWEI,
  getProviderOrSigner,
  INITIAL_ALLOWED_SLIPPAGE,
  isZero,
  ROUTER_ADDRESS,
  TX_DEADLINE,
} from "../utils/for-swap";
import { useWeb3 } from "./use-web3";

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Contract;
  parameters: SwapParameters;
}

interface SuccessfulCall extends SwapCallEstimate {
  gasEstimate: BigNumber;
}

interface FailedCall extends SwapCallEstimate {
  error: string;
}

interface SwapCallEstimate {
  call: SwapCall;
}

function useTransactionDeadline() {
  const { web3Instance } = useWeb3();
  const [timestamp, setTimestamp] = useState<number>();
  useEffect(() => {
    if (!web3Instance) return;
    (async () => {
      const blockNumber = await web3Instance?.eth.getBlockNumber();
      const number = await web3Instance?.eth.getBlock(blockNumber);
      setTimestamp(+number.timestamp + TX_DEADLINE);
    })();
  }, [web3Instance]);
  return timestamp;
}
// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
const BIPS_BASE = JSBI.BigInt(10000);

export function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE // in bips
): SwapCall[] {
  const {
    accountHex: account,
    chainId,
    etherProvider: library,
    web3Instance,
  } = useWeb3();

  const recipient = account;
  const deadline = useTransactionDeadline();

  return useMemo(() => {
    if (
      !trade ||
      !recipient ||
      !library ||
      !account ||
      !chainId ||
      !deadline ||
      !web3Instance
    )
      return [];

    const contract = new Contract(
      ROUTER_ADDRESS[chainId as ChainId],
      IRouterPancakeABI as any,
      getProviderOrSigner(library, account)
    );
    if (!contract) {
      return [];
    }

    const swapMethods = [];

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        deadline,
      })
    );

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          deadline,
        })
      );
    }

    return swapMethods.map((parameters) => ({ parameters, contract }));
  }, [
    account,
    allowedSlippage,
    chainId,
    deadline,
    library,
    recipient,
    trade,
    web3Instance,
  ]);
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
  const { etherProvider: library, chainId, account } = useWeb3();
  const gasPrice = GAS_PRICE_GWEI.testnet;

  const swapCalls = useSwapCallArguments(trade, allowedSlippage);

  // const addTransaction = useTransactionAdder();

  const recipient = account;

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }
    if (!recipient) {
      // if (recipientAddressOrName !== null) {
      //   return {
      //     state: SwapCallbackState.INVALID,
      //     callback: null,
      //     error: "Invalid recipient",
      //   };
      // }
      return { state: SwapCallbackState.LOADING, callback: null, error: null };
    }
    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: SwapCallEstimate[] = await Promise.all(
          swapCalls.map((call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call;
            const options = !value || isZero(value) ? {} : { value };

            return contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                console.log("🚀 -> .then -> gasEstimate", gasEstimate);
                return {
                  call,
                  gasEstimate,
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
                      error: callError,
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
          throw new Error(
            "Unexpected error. Could not estimate gas for the swap."
          );
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation;

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          gasPrice,
          ...(value && !isZero(value)
            ? { value, from: account }
            : { from: account }),
        })
          .then((response: any) => {
            console.log("🚀 -> .then -> response", response);
            // const inputSymbol = trade.inputAmount.currency.symbol;
            // const outputSymbol = trade.outputAmount.currency.symbol;
            // const inputAmount = trade.inputAmount.toSignificant(3);
            // const outputAmount = trade.outputAmount.toSignificant(3);

            // const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;
            // const withRecipient =
            //   recipient === account
            //     ? base
            //     : `${base} to ${
            //         recipientAddressOrName && isAddress(recipientAddressOrName)
            //           ? truncateHash(recipientAddressOrName)
            //           : recipientAddressOrName
            //       }`;

            // addTransaction(response, {
            //   summary: withRecipient,
            // });

            return response.hash;
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error("Transaction rejected.");
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value);
              throw new Error(error);
            }
          });
      },
      error: null,
    };
  }, [trade, library, account, chainId, recipient, swapCalls, gasPrice]);
}

/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 */
// function swapErrorToUserReadableMessage(error: any, t: TranslateFunction) {
//   let reason: string | undefined;
//   while (error) {
//     reason = error.reason ?? error.data?.message ?? error.message ?? reason;
//     // eslint-disable-next-line no-param-reassign
//     error = error.error ?? error.data?.originalError;
//   }

//   if (reason?.indexOf("execution reverted: ") === 0)
//     reason = reason.substring("execution reverted: ".length);

//   switch (reason) {
//     case "PancakeRouter: EXPIRED":
//       return t(
//         "The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low."
//       );
//     case "PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT":
//     case "PancakeRouter: EXCESSIVE_INPUT_AMOUNT":
//       return t(
//         "This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance."
//       );
//     case "TransferHelper: TRANSFER_FROM_FAILED":
//       return t(
//         "The input token cannot be transferred. There may be an issue with the input token."
//       );
//     case "Pancake: TRANSFER_FAILED":
//       return t(
//         "The output token cannot be transferred. There may be an issue with the output token."
//       );
//     default:
//       if (reason?.indexOf("undefined is not an object") !== -1) {
//         console.error(error, reason);
//         return t(
//           "An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading."
//         );
//       }
//       return t(
//         "Unknown error%reason%. Try increasing your slippage tolerance.",
//         {
//           reason: reason ? `: "${reason}"` : "",
//         }
//       );
//   }
// }
