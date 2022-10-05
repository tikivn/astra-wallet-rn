import { Interface } from "@ethersproject/abi";
import { MaxUint256, Zero } from "@ethersproject/constants";
import { Currency, ETHER, Token, TokenAmount } from "@solarswap/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import erc20Abi from "../contracts/abis/erc20.json";
import { Erc20 } from "../contracts/types/Erc20";
import { calculateGasMargin, GAS_PRICE_GWEI } from "../utils/for-swap";
import addresses from "../utils/for-swap/addresses";
import { getContract } from "../utils/for-swap/contract-helper";
import { CallProps, multicall } from "../utils/for-swap/multicall";
import { useSignTransaction } from "./use-sign-transaction";
import { useWeb3 } from "./use-web3";

export const useTokenAllowance = (
  isFetch: boolean,
  setFetch: (isFetch: boolean) => void,
  token?: Token
) => {
  const [allowance, setAllowance] = useState();
  const { chainId, accountHex, etherProvider } = useWeb3();
  const call: CallProps | null = useMemo(
    () =>
      token?.address
        ? {
            methodName: "allowance",
            target: token?.address || "",
            params: [accountHex, addresses.ROUTER[chainId]],
          }
        : null,
    [accountHex, chainId, token]
  );
  const fetchData = useCallback(() => {
    if (!call) return;
    multicall(erc20Abi, [call], chainId, etherProvider)
      .then((result) => {
        if (result) {
          setFetch(false);
          setAllowance(result[0][0]);
        }
      })
      .catch((err) => {
        console.error("Error when fetch allowance: ", { error: err });
      });
  }, [call, chainId, etherProvider, setFetch]);

  useEffect(() => {
    if (!isFetch) {
      return;
    }

    fetchData();
  }, [fetchData, isFetch]);

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
  inputToken?: Currency
): [ApprovalState, () => Promise<void>, () => Promise<void>] {
  const { chainId, etherProvider, accountHex } = useWeb3();
  const [isFetchAllowance, setIsFetchAllowance] = useState(true);
  const spender = addresses.ROUTER[chainId];
  const token = useMemo(
    () => (inputToken instanceof Token ? inputToken : undefined),
    [inputToken]
  );
  const currentAllowance = useTokenAllowance(
    isFetchAllowance,
    setIsFetchAllowance,
    token
  );

  const { signTransaction } = useSignTransaction();

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!inputToken || !spender) return ApprovalState.UNKNOWN;

    if (inputToken.symbol === ETHER.symbol) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;
    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.equalTo(new TokenAmount(inputToken as Token, 0))
      ? ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [currentAllowance, inputToken, spender]);

  const tokenContract = useMemo(
    () =>
      token?.address
        ? (getContract(erc20Abi, token?.address ?? "", etherProvider) as Erc20)
        : null,
    [etherProvider, token]
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

    if (!spender) {
      console.error("no spender");
      return;
    }

    const options = {
      from: accountHex,
    };

    const estimatedGas = await tokenContract.estimateGas
      .approve(spender, MaxUint256, options)
      .catch(() => {
        // general fallback for tokens who restrict approval amounts
        console.log("An error occurred during estimatedGas for appove");
      });
    const intfErc20 = new Interface(erc20Abi);
    const encodeFunctionData = intfErc20.encodeFunctionData("approve", [
      spender,
      MaxUint256,
    ]);
    return signTransaction(encodeFunctionData, {
      value: Zero.toHexString(),
      to: token?.address,
      from: accountHex,
      gasLimit: calculateGasMargin(estimatedGas).toHexString(),
      gasPrice: GAS_PRICE_GWEI.testnet,
    })
      .then((response: any) => {
        setIsFetchAllowance(true);
        return response;
      })
      .catch((error: any) => {
        console.error("Failed to approve token", error);
      });
  }, [
    approvalState,
    token,
    tokenContract,
    spender,
    accountHex,
    signTransaction,
  ]);

  const approveTest = useCallback(async () => {
    try {
      if (!tokenContract) {
        return;
      }
      const estimatedGas = await tokenContract.estimateGas.approve(
        spender,
        Zero,
        {
          from: accountHex,
        }
      );
      const intfErc20 = new Interface(erc20Abi);
      const encodeFunctionData = intfErc20.encodeFunctionData("approve", [
        spender,
        0,
      ]);
      const params = {
        value: Zero.toHexString(),
        to: token?.address ?? "",
        from: accountHex,
        gasLimit: calculateGasMargin(estimatedGas).toHexString(),
        gasPrice: GAS_PRICE_GWEI.testnet,
      };
      const a = await signTransaction(encodeFunctionData, params);
      setIsFetchAllowance(true);
      console.log("success", { hash: a });
    } catch (error) {
      console.error("Failed to approve", { error });
    }
  }, [accountHex, signTransaction, spender, token, tokenContract]);

  return [approvalState, approve, approveTest];
}
