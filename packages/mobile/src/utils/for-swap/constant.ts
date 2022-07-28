import { ChainId } from "@astradefi/sdk";
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
export const INITIAL_ALLOWED_SLIPPAGE = 50; // 50/1000

export const TX_DEADLINE = 20 * 60; // 20p

export const ROUTER_ADDRESS = {
  [ChainId.MAINNET]: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  [ChainId.TESTNET]: "0xf6a7620F4fFF8197127a1C1c05CB5866bfC5a7CE",
};
