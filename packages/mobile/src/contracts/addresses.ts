import { ChainId } from "@solarswap/sdk";
export const ADDRESSES = {
  Multicall: {
    [ChainId.TESTNET as number]: "0x5b8407D00c5715599570B3D3548D8EB7D7478AdE",
    [ChainId.MAINNET as number]: "0x5b8407D00c5715599570B3D3548D8EB7D7478AdE",
  },
  WASA: {
    [ChainId.TESTNET as number]: "0x439E926DB4A9263d53b2ad66E1E3B052C607515D",
    [ChainId.MAINNET as number]: "0x439E926DB4A9263d53b2ad66E1E3B052C607515D",
  },
  ROUTER: {
    [ChainId.MAINNET as number]: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    [ChainId.TESTNET as number]: "0x26cfE3149c96AdBaC9F41469959cb7b4762Edc6D",
  },
  USDT: {
    [ChainId.MAINNET as number]: "0xeAcA2EF350DDFD56423B0bcd24d26Edeb0656E3F",
    [ChainId.TESTNET as number]: "0xeAcA2EF350DDFD56423B0bcd24d26Edeb0656E3F",
  },
};
