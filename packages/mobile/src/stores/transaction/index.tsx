import { Staking } from "@keplr-wallet/stores";
import { computed, makeObservable, observable } from "mobx";
import { useStore } from "..";

export type TxType = "send" | "withdraw" | "delegate" | "undelegate" | "redelegate" | "swap" | undefined;
export type TxState = "pending" | "success" | "failure" | undefined;

export class TransactionStore {
  constructor() {
    makeObservable(this);
  }

  protected _txType?: TxType = undefined;

  @observable protected _txState: TxState = undefined;
  @observable protected _txHash?: Uint8Array = undefined;

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

  updateTxHash(txHash: Uint8Array | undefined) {
    if (this._txHash != txHash) {
      this._txHash = txHash;
    }
  }

  rejectTransaction() {
    this._txType = undefined;
    this._txState = undefined;
    this._txHash = undefined;
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
