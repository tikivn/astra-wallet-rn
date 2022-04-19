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
}

export const EmbedChainInfos: AppChainInfo[] = [
  {
    rpc: "https://rpc.astra.bar",
    rest: "https://api.astra.bar",
    chainId: "astra-devnet-001",
    chainName: "Astra",
    stakeCurrency: {
      coinDenom: "ASTRA",
      coinMinimalDenom: "astra",
      coinDecimals: 6,
      coinGeckoId: "astra",
      coinImageUrl: "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("astra"),
    currencies: [
      {
        coinDenom: "ASTRA",
        coinMinimalDenom: "astra",
        coinDecimals: 6,
        coinGeckoId: "astra",
        coinImageUrl: "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ASTRA",
        coinMinimalDenom: "astra",
        coinDecimals: 6,
        coinGeckoId: "astra",
        coinImageUrl: "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
      },
    ],
    coinType: 118,
    features: ["ibc-transfer", "ibc-go"],
    chainSymbolImageUrl: "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/cosmos/txs/{txHash}",
    },
  },
  {
    rpc: "https://rpc.astranaut.network",
    rest: "https://api.astranaut.network",
    chainId: "astra_11110-1",
    chainName: "Astranaut",
    stakeCurrency: {
      coinDenom: "AASTRA",
      coinMinimalDenom: "aastra",
      coinDecimals: 6,
      coinGeckoId: "aastra",
      coinImageUrl: "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("astra"),
    currencies: [
      {
        coinDenom: "AASTRA",
        coinMinimalDenom: "aastra",
        coinDecimals: 6,
        coinGeckoId: "aastra",
        coinImageUrl: "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AASTRA",
        coinMinimalDenom: "aastra",
        coinDecimals: 6,
        coinGeckoId: "aastra",
        coinImageUrl: "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
      },
    ],
    coinType: 60,
    gasPriceStep: {
      low: 0,
      average: 2,
      high: 4,
    },
    features: ["ibc-transfer", "ibc-go"],
    chainSymbolImageUrl: "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
    txExplorer: {
      name: "Mintscan",
      txUrl: "https://www.mintscan.io/cosmos/txs/{txHash}",
    },
  },
];

export const AmplitudeApiKey = "dbcaf47e30aae5b712bda7f892b2f0c4";
