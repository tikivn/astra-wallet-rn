import { Msg } from "@cosmjs/launchpad";
import { AnyWithUnpacked, SignDocWrapper } from "@keplr-wallet/cosmos";
import { IAmountConfig, IFeeConfig, IMemoConfig, SignDocHelper } from "@keplr-wallet/hooks";
import { Staking } from "@keplr-wallet/stores";
import { ChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { computed, makeObservable, observable } from "mobx";
import { useStore } from "..";

export type TxType = "send" | "withdraw" | "delegate" | "undelegate" | "redelegate" | "swap" | undefined;
export type TxState = "pending" | "success" | "failure" | undefined;
export type TxData = {
  chainInfo?: ChainInfo,
  amount?: IAmountConfig,
  fee?: IFeeConfig,
  memo?: IMemoConfig,
};

export class TransactionStore {
  constructor() {
    makeObservable(this);
  }

  protected _txType?: TxType = undefined;
  protected _txTime?: Date = undefined;

  @observable protected _txState: TxState = undefined;
  @observable protected _txHash?: Uint8Array = undefined;
  @observable protected _txData?: TxData = undefined;

  @observable protected _txAmount?: CoinPretty = undefined;
  @observable protected _txFee?: CoinPretty = undefined;

  @observable protected _signDocHelper?: SignDocHelper = undefined;

  @computed
  get txType(): TxType {
    return this._txType;
  }

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
  get txData(): TxData | undefined {
    return this._txData;
  }

  @computed
  get signDocHelper(): SignDocHelper | undefined {
    return this._signDocHelper;
  }

  @computed
  get txAmount(): CoinPretty | undefined {
    const amount = this._txData?.amount;
    if (amount) {
      return new CoinPretty(
        amount.sendCurrency,
        new Dec(amount.getAmountPrimitive().amount)
      )
        .trim(true)
        .maxDecimals(6)
        .upperCase(true);
    }
    return undefined;
  }

  @computed
  get txFee(): CoinPretty | undefined {
    const fee = this._txData?.fee;
    if (fee && fee.fee) {
      return fee.fee
        .trim(true)
        .maxDecimals(6)
        .upperCase(true);
    }
    return undefined;
  }

  @computed
  get txTime(): string | undefined {
    return this._txTime?.toLocaleTimeString() + ", " + this._txTime?.toLocaleDateString();
  }

  protected setAmount() {
    const amount = this._txData?.amount;
    if (amount) {
      this._txAmount = new CoinPretty(
        amount.sendCurrency,
        new Dec(amount.getAmountPrimitive().amount)
      )
        .trim(true)
        .maxDecimals(6)
        .upperCase(true);
    }
  }

  protected setFee() {
    const fee = this._txData?.fee;
    if (fee && fee.fee) {
      this._txFee = fee.fee
        .trim(true)
        .maxDecimals(6)
        .upperCase(true);
    }
  }

  updateTxType(txType: TxType) {
    if (this._txType != txType) {
      this._txType = txType;
    }
  }

  updateTxState(txState: TxState) {
    if (this._txState != txState) {
      this._txState = txState;
    }
  }

  updateTxData(txData: TxData) {
    this._txData = txData;
    this._txTime = new Date();
    this.setAmount();
    this.setFee();
  }

  updateTxHash(txHash: Uint8Array | undefined) {
    if (this._txHash != txHash) {
      this._txHash = txHash;
    }
  }

  updateSignDocHelper(signDocHelper: SignDocHelper | undefined) {
    this._signDocHelper = signDocHelper;
  }

  async startTransaction() {
    const { signInteractionStore } = useStore();
    try {
      const wrapper = this._signDocHelper?.signDocWrapper;
      if (wrapper) {
        await signInteractionStore.approveAndWaitEnd(wrapper);
      }
    } catch (error) {
      console.log(error);
    }
  }

  rejectTransaction() {
    this._txType = undefined;
    this._txState = undefined;
    this._txHash = undefined;
    this._txAmount = undefined;
    this._txFee = undefined;
    this._signDocHelper = undefined;
  }

  getDelegations(params: {
    chainId?: string,
    validatorAddress: string
  }): Staking.Delegation[] | undefined {
    const { chainStore, accountStore, queriesStore } = useStore();
    const { chainId = chainStore.current.chainId, validatorAddress } = params;

    const account = accountStore.getAccount(chainId);
    const queries = queriesStore.get(chainId);

    const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
      account.bech32Address
    );
    const delegations = queryDelegations.delegations;

    return delegations.filter((del) => {
      return del.delegation.validator_address === validatorAddress;
    });
  }

  getValidator(params: {
    chainId?: string,
    validatorAddress: string
  }): Staking.Validator | undefined {
    const { queriesStore, chainStore } = useStore();
    const { chainId = chainStore.current.chainId, validatorAddress } = params;

    const queries = queriesStore.get(chainId);
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
