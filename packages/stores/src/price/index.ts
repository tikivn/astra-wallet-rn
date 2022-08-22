import { ObservableQuery, QueryResponse } from "../common";
import { CoinGeckoSimplePrice } from "./types";
import Axios, { CancelToken } from "axios";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { Dec, CoinPretty, Int } from "@keplr-wallet/unit";
import { FiatCurrency } from "@keplr-wallet/types";
import { PricePretty } from "@keplr-wallet/unit/build/price-pretty";
import { DeepReadonly } from "utility-types";
import { action, flow, makeObservable, observable } from "mobx";

export class CoinGeckoPriceStore extends ObservableQuery<CoinGeckoSimplePrice> {
  protected coinIds: string[];
  protected vsCurrencies: string[];

  @observable
  protected _defaultVsCurrency: string;

  protected _supportedVsCurrencies: {
    [vsCurrency: string]: FiatCurrency | undefined;
  };

  constructor(
    kvStore: KVStore,
    supportedVsCurrencies: {
      [vsCurrency: string]: FiatCurrency;
    },
    defaultVsCurrency: string
  ) {
    const instance = Axios.create({
      baseURL: "https://api.tiki.vn/sandseel/api/v2",
    });

    super(kvStore, instance, "/public/markets/astra/summary");
    super.fetch();

    this.coinIds = [];
    this.vsCurrencies = [];
    this._defaultVsCurrency = defaultVsCurrency;

    this._supportedVsCurrencies = supportedVsCurrencies;

    makeObservable(this);

    this.restoreDefaultVsCurrency();
  }

  get defaultVsCurrency(): string {
    return this._defaultVsCurrency;
  }

  @action
  setDefaultVsCurrency(defaultVsCurrency: string) {
    this._defaultVsCurrency = defaultVsCurrency;
    this.saveDefaultVsCurrency();
  }

  @flow
  *restoreDefaultVsCurrency() {
    const saved = yield* toGenerator(
      this.kvStore.get<string>("__default_vs_currency")
    );
    if (saved) {
      this._defaultVsCurrency = saved;
    }
  }

  async saveDefaultVsCurrency() {
    await this.kvStore.set("__default_vs_currency", this.defaultVsCurrency);
  }

  get supportedVsCurrencies(): DeepReadonly<{
    [vsCurrency: string]: FiatCurrency | undefined;
  }> {
    return this._supportedVsCurrencies;
  }

  getFiatCurrency(currency: string): FiatCurrency | undefined {
    return this._supportedVsCurrencies[currency];
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<{ response: QueryResponse<CoinGeckoSimplePrice>; headers: any }> {
    const response = await super.fetchResponse(cancelToken);
    return response;
  }

  protected getCacheKey(): string {
    // Because the uri of the coingecko would be changed according to the coin ids and vsCurrencies.
    // Therefore, just using the uri as the cache key is not useful.
    return `${this.instance.name}-${
      this.instance.defaults.baseURL
    }${this.instance.getUri({
      url: "/simple/price",
    })}`;
  }

  getPrice(): number {
    const coinPrice = this.response?.data?.ticker?.last;
    return Number(coinPrice || 0);
  }

  getPriceChangePercent(): string {
    const percent = this.response?.data?.ticker?.price_change_percent;
    return String(percent || "0%");
  }

  calculatePrice(
    coin: CoinPretty,
    vsCurrrency?: string
  ): PricePretty | undefined {
    if (!coin.currency.coinGeckoId) {
      return undefined;
    }

    if (!vsCurrrency) {
      vsCurrrency = this.defaultVsCurrency;
    }

    const fiatCurrency = this.supportedVsCurrencies[vsCurrrency];
    if (!fiatCurrency) {
      return undefined;
    }

    const price = this.getPrice();
    if (price === undefined) {
      return new PricePretty(fiatCurrency, new Int(0)).ready(false);
    }

    const dec = coin.toDec();
    const priceDec = new Dec(price.toString());
    return new PricePretty(fiatCurrency, dec.mul(priceDec));
  }
}
