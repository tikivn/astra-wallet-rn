import type { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { ChainId } from "@solarswap/sdk";
import { Address } from ".";
import MultiCallAbi from "../../contracts/abis/Multicall.json";
import { Multicall } from "../../contracts/types/Multicall";
import addresses from "./addresses";

export const getAddress = (address: Address, chainId?: ChainId): string => {
  const chain = chainId || ChainId.TESTNET;
  return address[chain] || "";
};
export const simpleRpcProvider = new StaticJsonRpcProvider(
  getAddress(addresses.ROUTER)
);
export const getContract = (
  abi: any,
  address: string,
  signer?: Signer | Provider
) => {
  const signerOrProvider = signer ?? simpleRpcProvider;
  return new Contract(address, abi, signerOrProvider as any) as any;
};

export const getMulticallContract = (
  chainId?: ChainId,
  provider?: Provider
) => {
  return getContract(
    MultiCallAbi,
    getAddress(addresses.Multicall, chainId),
    provider
  ) as Multicall;
};
