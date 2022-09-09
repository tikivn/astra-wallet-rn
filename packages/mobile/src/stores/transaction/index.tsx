import { Msg } from "@cosmjs/launchpad";
import { AnyWithUnpacked, SignDocWrapper } from "@keplr-wallet/cosmos";
import {
  SignDocHelper,
} from "@keplr-wallet/hooks";
import {
  AccountStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  QueriesStore,
  SecretAccount,
  SecretQueries,
  SignInteractionStore,
  Staking,
} from "@keplr-wallet/stores";
import { ChainStore } from "../chain";
import { CoinPretty } from "@keplr-wallet/unit";
import { action, computed, makeObservable, observable } from "mobx";

export type TxState = "pending" | "success" | "failure" | undefined;

export class TransactionStore {
  constructor(
    protected readonly signInteractionStore: SignInteractionStore,
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: AccountStore<
      [CosmosAccount, CosmwasmAccount, SecretAccount]
    >,
    protected readonly queriesStore: QueriesStore<
      [CosmosQueries, CosmwasmQueries, SecretQueries]
    >
  ) {
    makeObservable(this);
  }

  @observable protected _txState: TxState = undefined;
  @observable protected _txHash?: Uint8Array = undefined;
  @observable protected _rawData?: {
    type: string,
    value: Record<string, any>,
  } = undefined;
  @observable protected _txAmount?: CoinPretty = undefined;

  @observable protected _signDocHelper?: SignDocHelper = undefined;

  @computed
  get txState(): TxState {
    return this._txState;
  }

  @computed
  get txHash(): Uint8Array | undefined {
    return this._txHash;
  }

  @computed
  get txMsgs(): readonly Msg[] | AnyWithUnpacked[] | undefined {
    const wrapper = this._signDocHelper?.signDocWrapper;
    if (!wrapper) {
      return undefined;
    }

    return wrapper?.mode === "amino"
      ? wrapper?.aminoSignDoc.msgs
      : wrapper?.protoSignDoc.txMsgs;
  }

  @computed
  get txMsgsMode(): SignDocWrapper["mode"] | undefined {
    return this._signDocHelper?.signDocWrapper?.mode;
  }

  @computed
  get rawData(): {
    type: string,
    value: Record<string, any>,
  } | undefined {
    return this._rawData;
  }

  @computed
  get signDocHelper(): SignDocHelper | undefined {
    return this._signDocHelper;
  }

  @computed
  get txAmount(): CoinPretty | undefined {
    return this._txAmount;
  }

  @action
  protected setAmount() {
    const value = this._rawData?.value;
    if (value) {
      if (value["amount"]) {
        this._txAmount = value["amount"] as CoinPretty;
      }
      else if (value["totalRewards"]) {
        this._txAmount = value["totalRewards"] as CoinPretty;
      }
    }
  }

  @action
  updateTxState(txState: TxState) {
    if (this._txState != txState) {
      this._txState = txState;
    }
  }

  @action
  updateRawData(rawData: {
    type: string,
    value: Record<string, any>,
  }) {
    this._rawData = rawData;
    this.setAmount();
  }

  @action
  updateTxHash(txHash: Uint8Array | undefined) {
    if (this._txHash != txHash) {
      this._txHash = txHash;
    }
  }
  @action
  updateSignDocHelper(signDocHelper: SignDocHelper | undefined) {
    this._signDocHelper = signDocHelper;
  }

  async startTransaction() {
    try {
      const wrapper = this._signDocHelper?.signDocWrapper;
      if (wrapper) {
        await this.signInteractionStore.approveAndWaitEnd(wrapper);
        console.log("__Transacion__ done");
      }
    } catch (error) {
      console.log("__Transacion__", error);
    }
  }

  @action
  rejectTransaction() {
    this._txState = undefined;
    this._txHash = undefined;
    this._txAmount = undefined;
    this._signDocHelper = undefined;
    this._rawData = undefined;
  }

  getDelegations(params: {
    chainId?: string;
    delegatorAddress?: string;
    validatorAddress?: string;
  }): Staking.Delegation[] | undefined {
    const {
      chainId = this.chainStore.current.chainId,
      delegatorAddress,
      validatorAddress,
    } = params;

    const account = this.accountStore.getAccount(chainId);
    const queries = this.queriesStore.get(chainId);

    const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
    const delegations = queryDelegations.delegations;

    return delegations.filter((del) => {
      return (!delegatorAddress || delegatorAddress === del.delegation.delegator_address)
        && (!validatorAddress || validatorAddress === del.delegation.validator_address);
    });
  }

  getValidator(params: {
    chainId?: string;
    validatorAddress: string;
  }): Staking.Validator | undefined {
    const {
      chainId = this.chainStore.current.chainId,
      validatorAddress,
    } = params;

    const queries = this.queriesStore.get(chainId);
    const validator =
      queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Bonded)
        .getValidator(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Unbonding)
        .getValidator(validatorAddress) ||
      queries.cosmos.queryValidators
        .getQueryStatus(Staking.BondStatus.Unbonded)
        .getValidator(validatorAddress);

    return validator;
  }
}
