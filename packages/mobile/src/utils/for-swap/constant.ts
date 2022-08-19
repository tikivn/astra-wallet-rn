import { ChainId, JSBI, Percent } from "@solarswap/sdk";
import { parseUnits } from "@ethersproject/units";

export enum GAS_PRICE {
  default = "5",
  fast = "6",
  instant = "7",
  testnet = "10",
}

export const GAS_PRICE_GWEI = {
  default: parseUnits(GAS_PRICE.default, "gwei").toString(),
  fast: parseUnits(GAS_PRICE.fast, "gwei").toString(),
  instant: parseUnits(GAS_PRICE.instant, "gwei").toString(),
  testnet: parseUnits(GAS_PRICE.testnet, "gwei").toString(),
};

export const TX_DEADLINE = 20 * 60; // 20p

export const SLIPPAGE_TOLERANCE = [100, 200, 500];
export const INITIAL_ALLOWED_SLIPPAGE = SLIPPAGE_TOLERANCE[1]; // 50/1000

export const BIPS_BASE = JSBI.BigInt(10000);

export const BASE_FEE = new Percent(JSBI.BigInt(25), BIPS_BASE);

export const INTERNAL_DELAY = 5 * 1000; // 5s

//interval stop time when value does not change
export const INTERVAL_STOP = 20 * 1000; // 20s

export const FIXED_DECIMAL_PLACES = 4;

export const RPC_ENPOINT = {
  [ChainId.TESTNET as number]: "https://rpc.astranaut.dev",
};

export const TIME_DEBOUNCE = 300;

export enum ERROR_KEY {
  INSUFFICIENT_BALANCE = "InsufficientBalances",
  INVALID_INPUT = "InvalidInput",
}
