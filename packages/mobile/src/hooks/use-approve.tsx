import { EthSignType } from "@keplr-wallet/types";
import {
  CurrencyAmount,
  ETHER,
  Token,
  TokenAmount,
  Trade,
} from "@solarswap/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import Web3 from "web3";
import erc20Abi from "../contracts/abis/erc20.json";
import { ADDRESSES } from "../contracts/addresses";
import { CallProps, multicall } from "../providers/swap/multicall";
import { useStore } from "../stores";
import {
  calculateGasMargin,
  computeSlippageAdjustedAmounts,
  GAS_PRICE_GWEI,
  MaxUint256,
  SwapField,
} from "../utils/for-swap";
import { useSignTransaction } from "./use-sign-transaction";
import { useWeb3 } from "./use-web3";

export const useTokenAllowance = (token?: Token) => {
  const [allowance, setAllowance] = useState();
  const { web3Instance, chainId, accountHex } = useWeb3();
  const call: CallProps = {
    methodName: "allowance",
    target: token?.address || "",
    inputs: [accountHex, ADDRESSES.ROUTER[chainId]],
  };

  useEffect(() => {
    (async () => {
      const allowance = await multicall(
        erc20Abi,
        [call],
        web3Instance,
        chainId
      );
      if (allowance) {
        setAllowance(allowance[0][0]);
      }
    })();
  }, [call, chainId, web3Instance]);

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance) : undefined),
    [token, allowance]
  );
};
export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}
export function useApproveCallback(
  amountToApprove?: CurrencyAmount
): [ApprovalState, () => Promise<void>, () => Promise<void>] {
  const { chainId, web3Instance, accountHex } = useWeb3();
  const spender = ADDRESSES.ROUTER[chainId];
  const token =
    amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;
  const currentAllowance = useTokenAllowance(token);

  const signTransaction = useSignTransaction();

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;

    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;
    console.log("currentAllowance", currentAllowance.toFixed(4));
    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, currentAllowance, spender]);

  const tokenContract = new web3Instance.eth.Contract(
    erc20Abi as any,
    token?.address
  );
  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error("approve was called unnecessarily");
      return;
    }
    if (!token) {
      console.error("no token");
      return;
    }

    if (!tokenContract) {
      console.error("tokenContract is null");
      return;
    }

    if (!amountToApprove) {
      console.error("missing amount to approve");
      return;
    }

    if (!spender) {
      console.error("no spender");
      return;
    }

    let useExact = false;

    const estimatedGas = await tokenContract.methods
      .approve(spender, MaxUint256)
      .estimateGas({ from: accountHex })
      .catch(() => {
        // general fallback for tokens who restrict approval amounts
        useExact = true;
        return tokenContract.methods
          .approve(spender, amountToApprove.raw.toString())
          .estimateGas({ from: accountHex });
      });
    const functionABI = tokenContract.methods
      .approve(spender, useExact ? amountToApprove.raw.toString() : MaxUint256)
      .encodeABI();
    return signTransaction(functionABI, {
      value: 0,
      to: token?.address,
      from: accountHex,
      gas: calculateGasMargin(estimatedGas),
      gasPrice: GAS_PRICE_GWEI.testnet,
    })
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("Failed to approve token", error);
      });
  }, [
    approvalState,
    token,
    tokenContract,
    amountToApprove,
    spender,
    accountHex,
    signTransaction,
  ]);

  const approveTest = useCallback(async () => {
    try {
      const estimatedGas = await tokenContract.methods
        .approve(spender, 0)
        .estimateGas({ from: accountHex });
      const functionAbi = tokenContract.methods.approve(spender, 0).encodeABI();

      const a = await signTransaction(functionAbi, {
        value: 0,
        to: token?.address,
        from: accountHex,
        gas: calculateGasMargin(estimatedGas),
        gasPrice: GAS_PRICE_GWEI.testnet,
      });
      console.log("success", { asd: a });
    } catch (error) {
      console.error("Failed to approve", { error });
    }
  }, [accountHex, signTransaction, spender, token, tokenContract.methods]);

  return [approvalState, approve, approveTest];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(
  trade?: Trade,
  allowedSlippage = 0
) {
  const amountToApprove = useMemo(
    () =>
      trade
        ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[
            SwapField.Input
          ]
        : undefined,
    [trade, allowedSlippage]
  );

  return useApproveCallback(amountToApprove);
}
