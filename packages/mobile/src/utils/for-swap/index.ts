// eslint-disable-next-line import/no-extraneous-dependencies
/* eslint-disable import/no-extraneous-dependencies */
import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import {
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Percent,
} from "@solarswap/sdk";
import { SwapInfoState } from "../../providers/swap/reducer";
import { BIPS_BASE } from "./constant";
export * from "./compute-price";
export * from "./constant";
export * from "./wrapped-currency";

/**
 * Truncate a transaction or address hashø
 */
export interface Address {
  [ChainId.TESTNET]?: string;
  [ChainId.MAINNET]: string;
}
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
export function calculateGasMargin(value: any) {
  const bn = BigNumber.from(value);
  return bn
    .mul(BigNumber.from(10000))
    .add(BigNumber.from(1000))
    .div(BigNumber.from(10000));
}

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

export enum SwapField {
  Input = "Input",
  Output = "Output",
}

export const getExchangeRateString = (
  { dependentField, independentField }: SwapInfoState,
  currencies: { [K in SwapField]: Currency | undefined },
  price?: string
) => {
  return `1 ${currencies[dependentField]?.symbol} ≈ ${price || ""} ${
    currencies[independentField]?.symbol
  }`;
};

export const getTransactionFee = (
  currencies: { [K in SwapField]: Currency | undefined },
  lpFee?: string
) => {
  return `${lpFee || 0} ${currencies[SwapField.Input]?.symbol}`;
};

export const getSlippageTolaranceString = ({
  slippageTolerance,
}: SwapInfoState) => {
  return `${slippageTolerance / 100} %`;
};

export const isValueLessThanOrEqualBalance = (
  inputValue: string,
  balance: string | CurrencyAmount
) => {
  let bls = balance;

  if (typeof balance !== "string") {
    bls = balance.toExact();
  }
  const vl = BigNumber.from(inputValue);
  const bl = BigNumber.from(bls);

  return vl.lte(bl);
};
