import "./src/background/background";

import { Keplr } from "@keplr-wallet/provider";
import { RNMessageRequesterInternal } from "./src/router";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.astra = new Keplr("", new RNMessageRequesterInternal());
