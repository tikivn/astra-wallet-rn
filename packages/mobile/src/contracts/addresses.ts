import { ChainId } from "@solarswap/sdk";
export const ADDRESSES = {
  Multicall: {
    [ChainId.TESTNET as number]: "0x464EaBfB56a542231dCf641106333f7C7FD707Bd",
    [ChainId.MAINNET as number]: "0x464EaBfB56a542231dCf641106333f7C7FD707Bd",
  },
  WASA: {
    [ChainId.TESTNET as number]: "0xEfd086F56311a6DD26DF0951Cdd215F538689B3a",
    [ChainId.MAINNET as number]: "0xEfd086F56311a6DD26DF0951Cdd215F538689B3a",
  },
  ROUTER: {
    [ChainId.MAINNET as number]: "0x1FAB8bdf244da099aC719FB4D393644D5fa4C6c4",
    [ChainId.TESTNET as number]: "0x1FAB8bdf244da099aC719FB4D393644D5fa4C6c4",
  },
  USDT: {
    [ChainId.MAINNET as number]: "0xeAcA2EF350DDFD56423B0bcd24d26Edeb0656E3F",
    [ChainId.TESTNET as number]: "0xeAcA2EF350DDFD56423B0bcd24d26Edeb0656E3F",
  },
};
