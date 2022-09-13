import { Interface } from "@ethersproject/abi";
import { Provider } from "@ethersproject/providers";
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
  chainId?: ChainId,
  provider?: Provider
): Promise<T> => {
  const multi = getMulticallContract(chainId, provider);
  const itf = new Interface(abi);

  const callData = calls.map((call) => ({
    target: call.target,
    callData: itf.encodeFunctionData(call.methodName, call.params),
  }));

  const { returnData } = await multi.aggregate(callData);

  const res = returnData.map((call, i) =>
    itf.decodeFunctionResult(calls[i].methodName, call)
  );

  return res as any;
};
