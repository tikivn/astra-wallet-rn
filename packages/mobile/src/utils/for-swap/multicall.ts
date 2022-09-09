import { Interface } from "@ethersproject/abi";
import { ChainId } from "@solarswap/sdk";
import { getMulticallContract } from "./contract-helper";

export interface CallProps {
  target: string; // Address of the contract
  methodName: string; // Function name on the contract (example: balanceOf)
  params?: any[]; // Function params
}
export const multicall = async <T = any>(
  abi: any[],
  calls: CallProps[],
  chainId?: ChainId
): Promise<T> => {
  const multi = getMulticallContract(chainId);
  const itf = new Interface(abi);

  const calldata = calls.map((call) => ({
    target: call.target.toLowerCase(),
    callData: itf.encodeFunctionData(call.methodName, call.params),
  }));
  const { returnData } = await multi.aggregate(calldata);

  const res = returnData.map((call, i) =>
    itf.decodeFunctionResult(calls[i].methodName, call)
  );

  return res as any;
};
