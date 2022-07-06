/* eslint-disable @typescript-eslint/no-empty-function */
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
import { getBasicAccessPermissionType, KeyRingStatus } from "@keplr-wallet/background";
import {
  EngineTypes,
  SessionTypes,
  SignClientTypes,
} from "@walletconnect/types";
import { Keplr } from "@keplr-wallet/provider";
import { RNRouterBackground } from "../../router";
import { makeSignDoc } from "@cosmjs/launchpad";
import { ClientMessageRequester } from "./client-requester";
import { WCMessageRequester } from "../wallet-connect/msg-requester";

export type SessionConnectInfor = {
  name: string;
  isConnect: boolean;
};

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

  protected createKeplrAPI(sessionId: string) {
    return new Keplr(
      "1.0",
      "core",
      new WCMessageRequester(RNRouterBackground.EventEmitter, sessionId)
    );
  }

  protected abstract onSessionConnected(_client: SignClient): Promise<void>;
}

export class SignClientStore extends SignClientManager {
  @observable
  protected _s: number = 0;

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
   Check that there is a wallet connect call from the client that was connected by deep link.
   */
  protected isPendingWcCallFromDeepLinkClient = false;
  /*
   Save the clients that was connected by the deep link.
   */
  // protected deepLinkClientKeyMap: Record<string, true | undefined> = {};
  @observable protected _pendingProposal:
    | SignClientTypes.EventArguments["session_proposal"]
    | undefined = undefined;

  @observable protected _pendingRequest:
    | SignClientTypes.EventArguments["session_request"]
    | undefined = undefined;

  @observable protected _changedConnection:
    | SessionConnectInfor
    | undefined = undefined;

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

  async disconnect(session: SessionTypes.Struct): Promise<void> {
    if (this.client) {
      await this.client.disconnect({
        topic: session.topic,
        reason: ERROR.DELETED.format(),
      });
      runInAction(() => {
        this._s = Math.random();
        this._onSessionChange({
          name: session.peer.metadata.name,
          isConnect: false,
        });
      });
    }
  }

  protected async onSessionConnected(_client: SignClient): Promise<void> {
    runInAction(() => {
      this.client = _client;
      this.client.on("session_proposal", (proposal) => {
        this.onSessionProposal(proposal);
      });
      this.client.on("session_request", (request) => {
        this.onSessionRequest(request);
      });
      this.client.on("session_delete", (data) => {
        console.log("session_delete", data);
        this.onSessionDelete(data);
      });
      this.client.on("session_ping", (data) => console.log("ping", data));
      this.client.on("session_event", (data) => console.log("event", data));
      this.client.on("session_update", (data) => console.log("update", data));
    });
  }

  protected async onSessionProposal(
    proposal: SignClientTypes.EventArguments["session_proposal"]
  ): Promise<void> {
    runInAction(() => {
      this._pendingProposal = proposal;
    });
  }

  protected async onSessionRequest(
    request: SignClientTypes.EventArguments["session_request"]
  ): Promise<void> {
    console.log("onSessionRequest: ", request);
    const params = request.params;
    if (params.request.method === "sign") {
      const requestParams = params.request.params;
      console.log("__WC V2__ requestParams: ", requestParams);
      const messages = requestParams.messages;
      console.log("__WC V2__ messsage: ", messages);
      const fee = requestParams.fee;
      console.log("__WC V2__ fee: ", fee);
      const signerData = requestParams.signerData;
      console.log("__WC V2__ signerData: ", signerData);
      await this.waitInitStores();
      const keplr = this.createKeplrAPI(request.topic);
      const permittedChains = await this.permissionStore.getOriginPermittedChains(
        WCMessageRequester.getVirtualSessionURL(request.topic),
        getBasicAccessPermissionType()
      );      
      const key = await keplr.getKey(signerData.chainId);
      console.log("__DEBUG__ key", key);
      if (messages && fee && signerData) {
        const signDoc = makeSignDoc(
          messages,
          fee,
          signerData.chainId,
          requestParams?.memo,
          signerData.accountNumber,
          signerData.sequence
        );
        console.log("__WC V2__ onSessionRequest with signDoc: ", signDoc);

        const result = await keplr.signAmino(
          signerData.chainId,
          key.bech32Address,
          signDoc,
          { preferNoSetFee: true }
        );
        console.log("__WC V2_ result: ", result);
      } else {
        console.log("Missing data");
      }

      runInAction(() => {
        this._pendingRequest = request;
      });
    }
  }

  protected async onSessionDelete(
    data: SignClientTypes.EventArguments["session_delete"]
  ): Promise<void> {
    runInAction(() => {
      this._s = Math.random();
    });
  }

  async pair(uri: string) {
    console.log("pair with: ", uri, this.client);
    if (this.client) {
      await this.client.pair({ uri });
    }
  }

  @computed
  get pendingProposal():
    | SignClientTypes.EventArguments["session_proposal"]
    | undefined {
    return this._pendingProposal;
  }

  @computed
  get pendingRequest():
    | SignClientTypes.EventArguments["session_request"]
    | undefined {
    return this._pendingRequest;
  }

  async approveProposal(payload: EngineTypes.ApproveParams) {
    if (this.client) {
      console.log("approveProposal", payload);
      const { acknowledged } = await this.client.approve(payload);
      await acknowledged();
      runInAction(() => {
        this._s = Math.random();
        this._onSessionChange({
          name: this._pendingProposal?.params.proposer.metadata.name ?? "",
          isConnect: true,
        });
        this._pendingProposal = undefined;
      });
    }
  }

  async rejectProposal() {
    if (this.client) {
      runInAction(() => {
        this._pendingProposal = undefined;
      });
    }
  }

  @computed
  get sessions(): SessionTypes.Struct[] {
    const key = this._s.toString();
    const tmp = { key: key, value: this.client?.session.values || [] };
    return tmp.value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _onSessionChange = (_infor: SessionConnectInfor) => {};
  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  onSessionChange(callback: { (infor: SessionConnectInfor): void }) {
    this._onSessionChange = callback;
  }
}
