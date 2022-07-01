import SignClient from "@walletconnect/sign-client";
import { ERROR } from "@walletconnect/utils";
import { KeyRingStore, PermissionStore } from "@keplr-wallet/stores";
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { ChainStore } from "../chain";
import { KVStore } from "@keplr-wallet/common";
import { KeyRingStatus } from "@keplr-wallet/background";
import { computedFn } from "mobx-utils";
import { AppState } from "react-native";
import { SignClientTypes } from "@walletconnect/types";

export abstract class SignClientManager {
  @observable
  protected client: SignClient | undefined;

  protected constructor(
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);
  }

  async initSignClient() {
    await this.waitInitStores();
    const _client = await SignClient.init({
      logger: "debug",
      projectId: "dd47fbeda006ccb670152d74136f846a",
      relayUrl: "wss://relay.astranaut.dev",
      metadata: {
        name: "Astra Hub",
        description: "Everything for Astra",
        url: "https://astranaut.io",
        icons: [
          "https://salt.tikicdn.com/ts/upload/ae/af/2a/d24e08ad40c1bec8958cc39d5bc924cc.png",
        ],
      },
    });
    this.onSessionConnected(_client);
  }

  protected async waitInitStores(): Promise<void> {
    // Wait until the chain store and account store is ready.
    if (this.chainStore.isInitializing) {
      await new Promise<void>((resolve) => {
        const disposer = autorun(() => {
          if (!this.chainStore.isInitializing) {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }

    if (this.keyRingStore.status !== KeyRingStatus.UNLOCKED) {
      await new Promise<void>((resolve) => {
        const disposer = autorun(() => {
          if (this.keyRingStore.status === KeyRingStatus.UNLOCKED) {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }
  }

  protected abstract onSessionConnected(_client: SignClient): Promise<void>;
}

export class SignClientStore extends SignClientManager {
  /*
   Indicate that there is a pending client that was requested from the deep link.
   Creating session take some time, but this store can't show the indicator.
   Component can show the indicator on behalf of this store if needed.
   */
  @observable
  protected _isPendingClientFromDeepLink: boolean = false;

  @observable
  protected _needGoBackToBrowser: boolean = false;

  /*
   XXX: Fairly hacky part.
        In Android, it seems posible that JS works, but all views deleted.
        This case seems to happen when the window size of the app is forcibly changed or the app is exited.
        But there doesn't seem to be an API that can detect this.
        The reason this is a problem is that the stores are all built with a singleton concept.
        Even if the view is initialized and recreated, this store is not recreated.
        In this case, the url handler of the deep link does not work and must be called through initialURL().
        To solve this problem, we leave the detection of the activity state to another component.
        If a component that cannot be unmounted is unmounted, it means the activity is killed.
   */
  protected _isAndroidActivityKilled = false;
  /*
   This means that how many wc call request is processing.
   When the call requested, should increase this.
   And when the requested call is completed, should decrease this.
   This field is only needed on the handler side, so don't need to be observable.
   */
  protected wcCallCount: number = 0;
  /*
   Check that there is a wallet connect call from the client that was connected by deep link.
   */
  protected isPendingWcCallFromDeepLinkClient = false;
  /*
   Save the clients that was connected by the deep link.
   */
  // protected deepLinkClientKeyMap: Record<string, true | undefined> = {};

  pendingProposal:
    | SignClientTypes.EventArguments["session_proposal"]
    | undefined;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore,
    protected readonly permissionStore: PermissionStore
  ) {
    super(chainStore, keyRingStore);
    makeObservable(this);
    this.initSignClient();
  }

  onAndroidActivityKilled() {
    this._isAndroidActivityKilled = true;
  }

  async disconnect(topic: string): Promise<void> {
    if (this.client) {
      await this.client.disconnect({ topic, reason: ERROR.DELETED.format() });
    }
  }

  protected async onSessionConnected(_client: SignClient): Promise<void> {
    runInAction(() => {
      this.client = _client;
      // this.client.on("session_proposal", onSessionProposal);
      this.client.on("session_proposal", (proposal) => {
        console.log("session_proposal: ", proposal);
        this.pendingProposal = proposal;
      });
    });
  }

  async pair(uri: string) {
    console.log("pair with: ", uri, this.client);
    if (this.client) {
      await this.client.pair({ uri });
    }
  }
}
