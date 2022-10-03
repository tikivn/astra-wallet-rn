import { TikiServiceProvider } from "@khanh-vo/service-provider-tiki";
import { TorusStorageLayer } from "@tkey/storage-layer-torus";
import { ShareSerializationModule, SHARE_SERIALIZATION_MODULE_NAME } from "@tkey/share-serialization";
import { SecurityQuestionsModule, SECURITY_QUESTIONS_MODULE_NAME } from "@tkey/security-questions";
import { SeedPhraseModule, SEED_PHRASE_MODULE_NAME, MetamaskSeedPhraseFormat } from "@tkey/seed-phrase";
import { action, computed, makeObservable, observable } from "mobx";
import { ModuleMap } from "@tkey/common-types";
import { Mnemonic } from "@keplr-wallet/crypto";
import ThresholdKey from "@tkey/default";
import BN from "bn.js";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SocialLoginConfigPROD, SocialLoginConfigUAT } from "./config";
import { loginWithApple } from "./apple-service";

export enum RegisterType {
  new, recover, unknown
}

export declare type ServiceProviderType = "apple" | "google" | "tiki";

export interface IServiceProvider {
  name: string;
  hostUrl: string;
  loginPath?: string;
}
declare type ServiceProviderMap = Record<ServiceProviderType, IServiceProvider>;

enum LoginErrorMsg {
  oauthFailed = "OAuth Failed",
  requiredLogin = "Required login before proceeding",
  infoNotFound = "Social login info not found",
}

export class UserLoginStore {
  KEY = "__socialLoginInfo__";
  protected _socialLoginEnabledFunc?: () => boolean;

  constructor(params: {
    socialLoginEnabledFunc?: () => boolean
  }) {
    const { socialLoginEnabledFunc } = params;
    this._socialLoginEnabledFunc = socialLoginEnabledFunc;

    const DEBUG = true;
    const { storageLayerUrl, serviceProviders } = DEBUG ? SocialLoginConfigUAT : SocialLoginConfigPROD;

    this._storageLayerUrl = storageLayerUrl;
    this._serviceProviders = serviceProviders;

    this.retrieveLoginData();

    makeObservable(this);
  }

  @action
  retrieveLoginData() {
    AsyncStorage.getItem(this.KEY).then((value) => {
      if (value) {
        const {
          isSocialLoginActive,
          shareB,
          serviceProviderType,
          socialLoginData
        } = JSON.parse(value);

        this._isSocialLoginActive = isSocialLoginActive ?? false;
        this._shareB = shareB;
        this._serviceProviderType = serviceProviderType;
        this._socialLoginData = socialLoginData;
      }
    });
  }

  protected SECUTIRY_QUESTION: string = "What's your password?";
  protected SEED_PHRASE_TYPE: string = "HD Key Tree";
  protected KEY_NOT_FOUND: string = "KEY_NOT_FOUND";

  protected _storageLayerUrl: string = "http://localhost:5051";
  protected _serviceProviders: ServiceProviderMap = {
    apple: {
      name: "apple",
      hostUrl: "http://localhost:9000",
      loginPath: "/login",
    },
    google: {
      name: "google",
      hostUrl: "http://localhost:9000",
      loginPath: "/login",
    },
    tiki: {
      name: "tiki",
      hostUrl: "http://localhost:9000",
      loginPath: "/login",
    },
  };

  protected _tKey?: ThresholdKey;
  protected _shareB?: string | null | undefined;

  protected _modules?: ModuleMap;
  protected _serviceProvider?: TikiServiceProvider;
  protected _storageLayer?: TorusStorageLayer;

  protected _serviceProviderType?: ServiceProviderType;

  get selectedServiceProviderType(): ServiceProviderType | undefined {
    return this._serviceProviderType;
  }

  //
  // Register Type
  //
  @observable
  protected _registerType: RegisterType = RegisterType.unknown;

  get registerType(): RegisterType {
    return this._registerType;
  }

  @action
  updateRegisterType(state: RegisterType) {
    this._registerType = state;
  }

  //
  // Threshold Key flow is active
  //
  @observable
  protected _isSocialLoginActive: boolean = false;

  @computed
  get isSocialLoginActive(): boolean {
    if (!this._socialLoginEnabledFunc || this._socialLoginEnabledFunc() !== true) {
      return false;
    }

    return this._isSocialLoginActive;
  }

  //
  // Social user data
  //
  @observable
  protected _socialLoginData?: any;

  @computed
  get socialLoginData(): any | undefined {
    if (!this._socialLoginEnabledFunc || this._socialLoginEnabledFunc() !== true) {
      return undefined;
    }

    return this._socialLoginData;
  }

  @action
  async openLogin(params: {
    serviceProviderType: ServiceProviderType,
    redirectUrl?: string,
  }) {
    const { serviceProviderType, redirectUrl = "app.keplr.oauth://" } = params;

    var { hostUrl, loginPath = "" } = this._serviceProviders[serviceProviderType];

    hostUrl = hostUrl.endsWith("/") ? hostUrl.substring(0, hostUrl.length - 1) : hostUrl;
    loginPath = loginPath.startsWith("/") ? loginPath.substring(1, loginPath.length) : loginPath;
    const url = `${hostUrl}/${loginPath}`;

    let socialLoginData: any;
    if (serviceProviderType === "apple") {
      try {
        const result = await loginWithApple(url);

        if (result.type !== "success") {
          throw new Error(LoginErrorMsg.oauthFailed);
        }

        socialLoginData = result.socialLoginData;
      }
      catch (e) {
        throw e;
      }
    }
    else {
      const result = await WebBrowser.openAuthSessionAsync(
        url,
        redirectUrl,
      );

      if (result.type !== "success") {
        throw new Error(LoginErrorMsg.oauthFailed);
      }

      socialLoginData = JSON.parse(
        Buffer.from(
          result.url.substring(result.url.indexOf("#") + 1),
          "base64"
        ).toString()
      );
    }

    const { shareB } = socialLoginData;

    const socialLoginInfo = {
      shareB,
      serviceProviderType,
      socialLoginData,
    };

    await AsyncStorage.setItem(this.KEY, JSON.stringify(socialLoginInfo));

    this._shareB = shareB;
    this._serviceProviderType = serviceProviderType;
    this._socialLoginData = socialLoginData;
  }

  @action
  async reconstructSocialLoginData(params: {
    password: string,
    mnemonic?: string,
  }) {
    const jsonString = await AsyncStorage.getItem(this.KEY);
    if (!jsonString) {
      throw new Error(LoginErrorMsg.requiredLogin);
    }

    var socialLoginInfo = JSON.parse(jsonString);
    const { shareB, serviceProviderType } = socialLoginInfo;

    const { mnemonic, password } = params;

    const modules = this.getModules();
    const storageLayer = this.getStorageLayer();
    const serviceProvider = this.getServiceProvider({ shareB, serviceProviderType });

    const shareStore = await storageLayer.getMetadata({ serviceProvider });
    const isNewUser = shareStore.message === this.KEY_NOT_FOUND;

    const tKey = new ThresholdKey({
      modules,
      storageLayer,
      serviceProvider,
      manualSync: isNewUser,
    });

    try {
      if (isNewUser) {
        const {
          mnemonic: validMnemonic,
          privateKey,
        } = await this.getValidMnemonicAndPrivateKey(mnemonic);

        await tKey._initializeNewKey({
          initializeModules: true,
          importedKey: new BN(privateKey),
        });

        await tKey.reconstructKey(false);
        await (tKey.modules[SECURITY_QUESTIONS_MODULE_NAME] as SecurityQuestionsModule).generateNewShareWithSecurityQuestions(
          password,
          this.SECUTIRY_QUESTION,
        );
        await (tKey.modules[SEED_PHRASE_MODULE_NAME] as SeedPhraseModule).setSeedPhrase(this.SEED_PHRASE_TYPE, validMnemonic);
        await tKey.syncLocalMetadataTransitions();
        await tKey.reconstructKey(false);
      }
      else {
        await tKey.initialize();
        await (tKey.modules[SECURITY_QUESTIONS_MODULE_NAME] as SecurityQuestionsModule).inputShareFromSecurityQuestions(
          password,
        );
        await tKey.reconstructKey(false);
      }
    }
    catch (e) {
      throw e;
    }

    this._tKey = tKey;

    this._modules = modules;
    this._storageLayer = storageLayer;
    this._serviceProvider = serviceProvider;

    socialLoginInfo = {
      ...socialLoginInfo,
      isSocialLoginActive: true,
    };

    await AsyncStorage.setItem(this.KEY, JSON.stringify(socialLoginInfo));

    this._isSocialLoginActive = true;
  }

  @action
  async clearLoginData() {
    await AsyncStorage.removeItem(this.KEY);

    this._isSocialLoginActive = false;
    this._shareB = undefined;
    this._serviceProviderType = undefined;
    this._socialLoginData = undefined;
  }

  async checkSocialLogin() {
    const jsonString = await AsyncStorage.getItem(this.KEY);
    if (!jsonString) {
      throw new Error(LoginErrorMsg.requiredLogin);
    }

    const socialLoginInfo = JSON.parse(jsonString);
    const { shareB, serviceProviderType, socialLoginData } = socialLoginInfo;

    if (!socialLoginData) {
      throw new Error(LoginErrorMsg.infoNotFound);
    }

    const storageLayer = this.getStorageLayer();
    const serviceProvider = this.getServiceProvider({ shareB, serviceProviderType });

    const shareStore = await storageLayer.getMetadata({ serviceProvider });
    const isNewUser = shareStore.message === this.KEY_NOT_FOUND;

    return {
      ...socialLoginInfo,
      isNewUser,
    };
  }

  async getSeedPhrase() {
    const seedPhrases = await (
      this._tKey?.modules[SEED_PHRASE_MODULE_NAME] as SeedPhraseModule
    ).getSeedPhrases();
    return seedPhrases[0].seedPhrase;
  }

  async getPassword() {
    return (
      this._tKey?.modules[SECURITY_QUESTIONS_MODULE_NAME] as SecurityQuestionsModule
    ).getAnswer();
  }

  async updatePassword(password: string) {
    await (
      this._tKey?.modules[SECURITY_QUESTIONS_MODULE_NAME] as SecurityQuestionsModule
    ).changeSecurityQuestionAndAnswer(
      password,
      this.SECUTIRY_QUESTION,
    );
  }

  async getValidMnemonicAndPrivateKey(mnemonic?: string) {
    let validMnemonic;
    if (mnemonic) {
      validMnemonic = mnemonic;
    }
    else {
      validMnemonic = await Mnemonic.generateSeed((array) => {
        return Promise.resolve(crypto.getRandomValues(array));
      })
    }
    const privateKey = Buffer.from(
      Mnemonic.generateWalletFromMnemonic(
        validMnemonic,
        `m/44'/60'/0'/0/0`
      )
    );

    console.log("__mnemonic__", validMnemonic);
    console.log("__privateKey__", privateKey.toString("hex"));

    return {
      mnemonic: validMnemonic,
      privateKey,
    }
  }

  protected getModules(): ModuleMap {
    const metamaskSeedPhraseFormat = new MetamaskSeedPhraseFormat(
      "https://mainnet.infura.io/v3/bca735fdbba0408bb09471e86463ae68"
    );
    return {
      [SECURITY_QUESTIONS_MODULE_NAME]: new SecurityQuestionsModule(true),
      [SHARE_SERIALIZATION_MODULE_NAME]: new ShareSerializationModule(),
      [SEED_PHRASE_MODULE_NAME]: new SeedPhraseModule([metamaskSeedPhraseFormat]),
    };
  }

  protected getServiceProvider(params: {
    shareB: string,
    serviceProviderType: ServiceProviderType,
  }) {
    const { shareB: postboxKey, serviceProviderType } = params;
    const { hostUrl } = this._serviceProviders[serviceProviderType];

    return new TikiServiceProvider({
      postboxKey,
      hostUrl,
    });
  }

  protected getStorageLayer() {
    return new TorusStorageLayer({
      hostUrl: this._storageLayerUrl,
    });
  }
}
