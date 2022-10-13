import { ChainId } from "@solarswap/sdk";
// eslint-disable-next-line import/no-default-export
export default {
  Multicall: {
    [ChainId.TESTNET]: "0x464EaBfB56a542231dCf641106333f7C7FD707Bd",
    [ChainId.MAINNET]: "0x464EaBfB56a542231dCf641106333f7C7FD707Bd",
  },
  WASA: {
    [ChainId.TESTNET]: "0xEfd086F56311a6DD26DF0951Cdd215F538689B3a",
    [ChainId.MAINNET]: "0xEfd086F56311a6DD26DF0951Cdd215F538689B3a",
  },
  ROUTER: {
    [ChainId.MAINNET]: "0x1FAB8bdf244da099aC719FB4D393644D5fa4C6c4",
    [ChainId.TESTNET]: "0x1FAB8bdf244da099aC719FB4D393644D5fa4C6c4",
  },
  USDT: {
    [ChainId.MAINNET]: "0x41591484aEB5FA3d1759f1cbA369dC8dc1281298",
    [ChainId.TESTNET]: "0x41591484aEB5FA3d1759f1cbA369dC8dc1281298",
  },
};
