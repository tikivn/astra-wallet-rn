import { EthSignType } from "@keplr-wallet/types";
import {
  ChainId,
  Router,
  SwapParameters,
  Trade,
  TradeType,
} from "@solarswap/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import Web3 from "web3";
import ISolardexRouter02 from "../contracts/abis/ISolardexRouter02.json";
import { ADDRESSES } from "../contracts/addresses";
import { useStore } from "../stores";
import {
  calculateSlippagePercent,
  GAS_PRICE_GWEI,
  INITIAL_ALLOWED_SLIPPAGE,
  isZero,
  TX_DEADLINE,
} from "../utils/for-swap";
import { useWeb3 } from "./use-web3";

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: any;
  parameters: SwapParameters;
}

interface SuccessfulCall extends SwapCallEstimate {
  gasEstimate: any;
}

interface FailedCall extends SwapCallEstimate {
  error: string;
}

interface SwapCallEstimate {
  functionAbi: any;
  value: any;
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

  const chain = chainId || ChainId.TESTNET;

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

    const contract = new web3Instance.eth.Contract(
      ISolardexRouter02 as any,
      ADDRESSES.ROUTER[chain]
    );
    if (!contract) {
      return [];
    }
    const swapMethods = [];
    const allowedSlippagePercent = calculateSlippagePercent(allowedSlippage);
    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: allowedSlippagePercent,
        recipient,
        deadline,
      })
    );

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: allowedSlippagePercent,
          recipient,
          deadline,
        })
      );
    }

    return swapMethods.map((parameters) => ({ parameters, contract }));
  }, [
    account,
    allowedSlippage,
    chain,
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
  const {
    etherProvider: library,
    chainId,
    chainIdStr,
    accountHex,
    account,
    web3Instance,
  } = useWeb3();
  const chain = chainId || ChainId.TESTNET;
  const gasPrice = GAS_PRICE_GWEI.testnet;
  const {
    keyRingStore,
    accountStore,
    transactionStore,
    chainStore,
  } = useStore();
  const swapCalls = useSwapCallArguments(trade, allowedSlippage);
  const accountSignAsync = useMemo(async () => {
    if (!web3Instance) return;
    const privateKey = await keyRingStore.exportPrivateKey();
    return web3Instance.eth.accounts.privateKeyToAccount("0x" + privateKey);
  }, [keyRingStore, web3Instance]);

  const recipient = accountHex;

  // const signEthereum = useCallback(
  //   async (functionAbi: any, opts: { gas: any; value: any }) => {
  //     const keplr = await accountStore
  //       .getAccount(account.bech32Address)
  //       .getKeplr();
  //     const txParams = {
  //       gasPrice: Web3.utils.stringToHex(gasPrice),
  //       to: ADDRESSES.ROUTER[chain],
  //       data: functionAbi,
  //       from: accountHex,
  //       chainId: chain,
  //       nonce: Web3.utils.numberToHex(Math.floor(Math.random() * 1000)),
  //       gas: Web3.utils.numberToHex(opts.gas),
  //       value: opts.value,
  //     };
  //     transactionStore.updateTxType("swap");
  //     const sign = await keplr?.signEthereum(
  //       chainIdStr,
  //       account.bech32Address,
  //       JSON.stringify(txParams),
  //       EthSignType.TRANSACTION
  //     );
  //     // if (sign) {
  //     //   console.log("🚀 -> sign", sign);
  //     //   const hex = Buffer.from(sign).toString("hex");
  //     //   web3Instance.eth
  //     //     .sendSignedTransaction("0x" + hex)
  //     //     .on("transactionHash", (hash) => {
  //     //       console.log("🚀 -> .on -> hash", hash);
  //     //     })
  //     //     .on("error", (err) => {
  //     //       console.log("🚀 -> err", err);
  //     //     });
  //     // }

  //     transactionStore.updateTxHash(sign);
  //     // await transactionStore.startTransaction();
  //     // return sign;
  //   },
  //   [
  //     account.bech32Address,
  //     accountHex,
  //     accountStore,
  //     chain,
  //     chainIdStr,
  //     chainStore,
  //     gasPrice,
  //     transactionStore,
  //   ]
  // );

  const signTransaction = useCallback(
    async (functionAbi: any, opts: { gas: any; value: any }) => {
      const accountSign = await accountSignAsync;
      if (!web3Instance || !accountSign)
        return Promise.reject("An error occurred!");

      return new Promise<string>((resolve, reject) => {
        web3Instance.eth
          .getTransactionCount(accountSign.address)
          .then((_nonce) => {
            const txParams = {
              gasPrice,
              to: ADDRESSES.ROUTER[chain],
              data: functionAbi,
              from: accountSign.address,
              nonce: web3Instance.utils.toHex(_nonce),
              ...opts,
            };
            accountSign
              .signTransaction(txParams as any)
              .then((signed) => {
                web3Instance.eth
                  .sendSignedTransaction(signed.rawTransaction || "")
                  .on("transactionHash", (hash) => {
                    resolve(hash);
                  })
                  .on("error", reject);
              })
              .catch(reject);
          });
      });
    },
    [accountSignAsync, chain, gasPrice, web3Instance]
  );

  return useMemo(() => {
    if (!trade || !library || !accountHex || !chainId) {
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: "Missing dependencies",
      };
    }
    if (!recipient) {
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

            const options =
              !value || isZero(value) ? {} : { value, from: accountHex };
            const contractFunction = contract.methods[methodName](...args);
            const functionAbi = contractFunction.encodeABI();
            return contractFunction
              .estimateGas(options)
              .then((gasEstimate: any) => {
                return {
                  functionAbi,
                  gasEstimate,
                  value,
                };
              })
              .catch((gasError: any) => {
                console.error(
                  "Gas estimate failed, trying eth_call to extract error",
                  { gasError, call }
                );
                return {
                  error: gasError,
                };
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

        const { functionAbi, gasEstimate, value } = successfulEstimation;
        return signTransaction(functionAbi, {
          gas: gasEstimate,
          value,
        })
          .then((hash) => {
            return hash;
          })
          .catch((error) => {
            console.log(
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
    swapCalls,
    signTransaction,
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
