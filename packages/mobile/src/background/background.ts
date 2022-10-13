import { init, ScryptParams } from "@keplr-wallet/background";
import {
  RNEnv,
  RNMessageRequesterInternalToUI,
  RNRouterBackground,
} from "../router";
import { AsyncKVStore } from "../common";
import scrypt from "react-native-scrypt";
import { Buffer } from "buffer/";
import { getRandomBytesAsync } from "../common";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { EmbedChainInfos } from "../config";

const router = new RNRouterBackground(RNEnv.produceEnv);

init(
  router,
  (prefix: string) => new AsyncKVStore(prefix),
  new RNMessageRequesterInternalToUI(),
  EmbedChainInfos,
  [
    "http://192.168.50.49:3000",
    "https://defi.astranaut.dev",
    "https://app.astranaut.dev",
  ],
  {
    rng: getRandomBytesAsync,
    scrypt: async (text: string, params: ScryptParams) => {
      return Buffer.from(
        await scrypt(
          Buffer.from(text).toString("hex"),
          // Salt is expected to be encoded as Hex
          params.salt,
          params.n,
          params.r,
          params.p,
          params.dklen,
          "hex"
        ),
        "hex"
      );
    },
  },
  {
    create: (params: {
      iconRelativeUrl?: string;
      title: string;
      message: string;
    }) => {
      console.log(`Notification: ${params.title}, ${params.message}`);
    },
  },
  {
    suggestChain: {
      useMemoryKVStore: true,
    },
  }
);

router.listen(BACKGROUND_PORT);
