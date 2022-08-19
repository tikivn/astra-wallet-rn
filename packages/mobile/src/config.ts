import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";

export const EthereumEndpoint =
  "https://mainnet.infura.io/v3/eeb00e81cdb2410098d5a270eff9b341";

export interface AppChainInfo extends ChainInfo {
  readonly chainSymbolImageUrl?: string;
  readonly hideInUI?: boolean;
  readonly txExplorer?: {
    readonly name: string;
    readonly txUrl: string;
  };
  readonly wcInfor?: {
    readonly relayUrl: string;
    readonly projectId: string;
    readonly metadata: {
      readonly name: string;
      readonly description: string;
      readonly url: string;
      readonly icons: [string];
    };
  };
  readonly chainIdNum?: number;
}

export const EmbedChainInfos: AppChainInfo[] = [
  {
    rpc: "https://rpc.astranaut.dev",
    rest: "https://api.astranaut.dev",
    chainId: "astra_11115-1",
    chainIdNum: 11115,
    chainName: "Testnet",
    stakeCurrency: {
      coinDenom: "ASA",
      coinMinimalDenom: "aastra",
      coinDecimals: 18,
      coinGeckoId: "aastra",
      coinImageUrl:
        "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png",
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("astra"),
    currencies: [
      {
        coinDenom: "ASA",
        coinMinimalDenom: "aastra",
        coinDecimals: 18,
        coinGeckoId: "aastra",
        coinImageUrl:
          "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png",
      },
      {
        coinDenom: "USDT",
        coinMinimalDenom: "usdt",
        coinDecimals: 18,
        coinImageUrl:
          "https://pancakeswap.finance/images/tokens/0x55d398326f99059fF775485246999027B3197955.png",
        contractAddress: "0xeAcA2EF350DDFD56423B0bcd24d26Edeb0656E3F",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ASA",
        coinMinimalDenom: "aastra",
        coinDecimals: 18,
        coinGeckoId: "aastra",
        coinImageUrl:
          "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
      },
    ],
    coinType: 60,
    gasPriceStep: {
      low: 500000000000,
      average: 1000000000000,
      high: 2000000000000,
    },
    features: ["ibc-transfer", "ibc-go", "eth-key-sign", "eth-address-gen"],
    chainSymbolImageUrl:
      "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
    txExplorer: {
      name: "Astra Scan",
      txUrl: "https://scan.astranaut.network/transaction/{txHash}",
    },
    wcInfor: {
      relayUrl: "wss://relay.astranaut.dev",
      projectId: "dd47fbeda006ccb670152d74136f846a",
      metadata: {
        name: "Astra Hub",
        description: "Everything for Astra",
        url: "https://astranaut.io",
        icons: [
          "https://salt.tikicdn.com/ts/upload/ae/af/2a/d24e08ad40c1bec8958cc39d5bc924cc.png",
        ],
      },
    },
  },
  {
    rpc: "https://evm.astranaut.network",
    rest: "https://api.astranaut.network",
    chainId: "astra_11112-1",
    chainIdNum: 11112,
    chainName: "Testnet (Deprecated)",
    stakeCurrency: {
      coinDenom: "ASA",
      coinMinimalDenom: "aastra",
      coinDecimals: 18,
      coinGeckoId: "aastra",
      coinImageUrl:
        "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png",
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("astra"),
    currencies: [
      {
        coinDenom: "ASA",
        coinMinimalDenom: "aastra",
        coinDecimals: 18,
        coinGeckoId: "aastra",
        coinImageUrl:
          "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png",
        contractAddress: "0x4fDC1FB9C36c855316bA66aAF2dc34aEfd680533",
      },
      {
        coinDenom: "USDT",
        coinMinimalDenom: "usdt",
        coinDecimals: 18,
        coinImageUrl:
          "https://pancakeswap.finance/images/tokens/0x55d398326f99059fF775485246999027B3197955.png",
        contractAddress: "0xf8B0c22089C5EE643A5bA475656Ca32Daf48eEcb",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ASA",
        coinMinimalDenom: "aastra",
        coinDecimals: 18,
        coinGeckoId: "aastra",
        coinImageUrl:
          "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
      },
    ],
    coinType: 60,
    gasPriceStep: {
      low: 500000000000,
      average: 1000000000000,
      high: 2000000000000,
    },
    features: ["ibc-transfer", "ibc-go", "eth-key-sign", "eth-address-gen"],
    chainSymbolImageUrl:
      "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
    txExplorer: {
      name: "Astra Scan",
      txUrl: "https://scan.astranaut.network/transaction/{txHash}",
    },
    wcInfor: {
      relayUrl: "wss://relay.walletconnect.com",
      projectId: "dd47fbeda006ccb670152d74136f846a",
      metadata: {
        name: "Astra Hub",
        description: "Everything for Astra",
        url: "https://astranaut.io",
        icons: [
          "https://salt.tikicdn.com/ts/upload/ae/af/2a/d24e08ad40c1bec8958cc39d5bc924cc.png",
        ],
      },
    },
  },
];

// export const AmplitudeApiKey = "dbcaf47e30aae5b712bda7f892b2f0c4";
