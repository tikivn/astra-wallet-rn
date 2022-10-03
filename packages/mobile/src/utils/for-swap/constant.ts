import { formatUnits, parseUnits } from "@ethersproject/units";
import { ChainId, ETHER, Fraction, JSBI, Percent } from "@solarswap/sdk";

export enum GAS_PRICE {
  default = "5",
  fast = "6",
  instant = "7",
  testnet = "10",
}

export const GAS_PRICE_GWEI = {
  default: parseUnits(GAS_PRICE.default, "gwei").toHexString(),
  fast: parseUnits(GAS_PRICE.fast, "gwei").toHexString(),
  instant: parseUnits(GAS_PRICE.instant, "gwei").toHexString(),
  testnet: parseUnits(GAS_PRICE.testnet, "gwei").toHexString(),
};

export const TX_DEADLINE = 20 * 60; // 20p

export const SLIPPAGE_TOLERANCE = [100, 200, 500];

export const INITIAL_ALLOWED_SLIPPAGE = SLIPPAGE_TOLERANCE[0]; // 50/1000

export const BIPS_BASE = JSBI.BigInt(10000);

export const BASE_FEE = new Percent(JSBI.BigInt(25), BIPS_BASE);

export const INTERNAL_DELAY = 15 * 1000; // 5s

//interval stop time when value does not change
export const INTERVAL_STOP = 30 * 1000; // 30s

export const DELAY_TRANSACTIONFEE = 500;

export const FIXED_DECIMAL_PLACES = 4;
export const SIGNIFICANT_DECIMAL_PLACES = 6;
export const MAXIMUM_PRICE_IMPACT = new Fraction(15, 100);

export const RPC_ENPOINT = {
  [ChainId.TESTNET as number]: "https://rpc.astranaut.dev",
};

export const TIME_DEBOUNCE = 0;

export enum ERROR_KEY {
  INSUFFICIENT_BALANCE = "InsufficientBalances",
  INVALID_INPUT = "InvalidInput",
  LIMIT_ONE_ASA = "LimitOneASA",
}
export const MIN_ASA: JSBI = JSBI.exponentiate(
  JSBI.BigInt(10),
  JSBI.BigInt(16)
); // .01 ASA

export const ONE_ASA = JSBI.BigInt(parseUnits("1", ETHER.decimals));
