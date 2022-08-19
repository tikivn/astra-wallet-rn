/* eslint-disable import/no-extraneous-dependencies */
import { CurrencyAmount, JSBI, Percent } from "@solarswap/sdk";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import Web3 from "web3";
import { Contract, ContractOptions } from "web3-eth-contract";
import { AbiItem, Unit } from "web3-utils";
import { SwapInfoState } from "../../providers/swap/reducer";
import { BIPS_BASE } from "./constant";
export * from "./compute-price";
export * from "./constant";
export * from "./wrapped-currency";

/**
 * Truncate a transaction or address hash
 */
export const truncateHash = (
  address: string,
  startLength = 4,
  endLength = 4
) => {
  return `${address.substring(0, startLength)}...${address.substring(
    address.length - endLength
  )}`;
};

// add 10%
// export function calculateGasMargin(value: BigNumber): BigNumber {
//   return value
//     .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
//     .div(BigNumber.from(10000));
// }

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString);
}

export function getSigner(
  library: Web3Provider,
  account: string
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}
export function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export const formatBalance = (balance?: string) => {
  if (!balance) {
    return "";
  }
  const balances = balance.split(".");
  return balances[0] + "." + balances[1].substring(0, 2);
};

export const calculateSlippagePercent = (slipage: number) => {
  return new Percent(JSBI.BigInt(slipage), BIPS_BASE);
};

export const getContract = (
  abi: AbiItem[] | AbiItem,
  address: string,
  web3: Web3,
  options?: ContractOptions
): Contract | null => {
  if (!web3) {
    return null;
  }
  return new web3.eth.Contract(abi, address, options);
};

export const encodeFunctionCall = (
  abis: AbiItem[] | AbiItem,
  methodName: string,
  params: any,
  web3: Web3
) => {
  let abi: AbiItem;
  if (Array.isArray(abis)) {
    abi = Array.from(abis).find(
      (item: AbiItem) => item.name === methodName && item.type === "function"
    ) as AbiItem;
  } else {
    abi = abis;
  }
  const callData = web3 && web3.eth.abi.encodeFunctionCall(abi, params);
  const typeOutputs = abi.outputs?.map((i) => i.type);
  return { callData, typeOutputs };
};

export enum SwapField {
  Input = "Input",
  Output = "Output",
}

export const getUnitMapKey = (decimal: number): Unit => {
  const unitMaps = Web3.utils.unitMap;
  for (const [key, value] of Object.entries(unitMaps)) {
    if (value.length - 1 === decimal) {
      return key as Unit;
    }
  }
  return "ether";
};

export const toBN = (value: string, decimal: number) => {
  return Web3.utils.toBN(Web3.utils.toWei(value, getUnitMapKey(decimal)));
};
export const isValueLessThanOrEqualBalance = (
  value: string,
  balance: string | CurrencyAmount,
  decimal: number
) => {
  let bl = balance;

  if (typeof balance !== "string") {
    bl = balance.toExact();
  }
  const valueWei = toBN(value, decimal);
  const balanceWei = toBN(bl as string, decimal);
  return valueWei.lte(balanceWei);
};

export const getExchangeRateString = (
  { currencies, dependentField, independentField }: SwapInfoState,
  price?: string
) => {
  return `1 ${currencies[dependentField]?.symbol} ≈ ${price || ""} ${
    currencies[independentField]?.symbol
  }`;
};

export const getTransactionFee = (
  { currencies }: SwapInfoState,
  lpFee?: string
) => {
  return `${lpFee || 0} ${currencies[SwapField.Input]?.symbol}`;
};

export const getSlippageTolaranceString = ({
  slippageTolerance,
}: SwapInfoState) => {
  return `${slippageTolerance / 100} %`;
};
