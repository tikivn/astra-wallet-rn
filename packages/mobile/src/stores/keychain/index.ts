import { flow, makeObservable, observable } from "mobx";
import * as Keychain from "react-native-keychain";
import { KVStore, toGenerator } from "@keplr-wallet/common";
import { KeyRingStore } from "@keplr-wallet/stores";

export class KeychainStore {
  @observable
  protected _isBiometrySupported: boolean = false;

  @observable
  protected _isBiometryType?: Keychain.BIOMETRY_TYPE;

  @observable
  protected _isBiometryOn: boolean = false;

  protected static defaultOptions: Keychain.Options = {
    authenticationPrompt: {
      title: "Biometric Authentication",
    },
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
  };

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);

    this.init();
  }

  get isBiometrySupported(): boolean {
    return this._isBiometrySupported;
  }

  get isBiometryType(): Keychain.BIOMETRY_TYPE | undefined {
    return this._isBiometryType;
  }

  get isBiometryOn(): boolean {
    return this._isBiometryOn;
  }

  @flow
  *tryUnlockWithBiometry() {
    if (!this.isBiometryOn) {
      throw new Error("Biometry is off");
    }

    const credentials = yield* toGenerator(
      Keychain.getGenericPassword(KeychainStore.defaultOptions)
    );
    if (credentials) {
      yield this.keyRingStore.unlock(credentials.password);
    } else {
      throw new Error("Failed to get credentials from keychain");
    }
  }

  /**
   * Enable biometrics with desired permission popup appears.
   * Require keyRing is existed & prior unlocked
   *
   * @param password Password is used to unlock wallet
   */
  async enableBiometrics(password: string) {
    try {
      await Keychain.resetGenericPassword(KeychainStore.defaultOptions);

      const result = await Keychain.setGenericPassword(
        "astra",
        password,
        KeychainStore.defaultOptions
      );
      if (result) {
        const hasEnabledBiometricsFirstTime = await this.hasEnabledBiometricsFirstTime();
        if (hasEnabledBiometricsFirstTime !== true) {
          await Keychain.getGenericPassword(KeychainStore.defaultOptions);
          await this.setHasEnabledBiometricsFirstTime();
        }

        this._isBiometryOn = true;
        await this.save();
      } else {
        throw new Error("Failed to enable biometrics");
      }
    } catch (e) {
      throw new Error("Failed to enable biometrics");
    }
  }

  /**
   * Disable biometrics
   */
  async disableBiometrics() {
    try {
      const credentials = await Keychain.getGenericPassword(
        KeychainStore.defaultOptions
      );
      if (credentials) {
        if (await this.keyRingStore.checkPassword(credentials.password)) {
          this._isBiometryOn = false;
          await this.save();
        } else {
          throw new Error("Failed to disable biometrics");
        }
      } else {
        throw new Error("Failed to get credentials from keychain");
      }
    } catch (e) {
      throw new Error("Failed to disable biometrics");
    }
  }

  @flow
  *turnOnBiometry(password: string) {
    const valid = yield* toGenerator(this.keyRingStore.checkPassword(password));
    if (valid) {
      const result = yield* toGenerator(
        Keychain.setGenericPassword(
          "keplr",
          password,
          KeychainStore.defaultOptions
        )
      );
      if (result) {
        this._isBiometryOn = true;
        yield this.save();
      }
    } else {
      throw new Error("Invalid password");
    }
  }

  @flow
  *turnOnBiometryWithoutPassword() {
    const credentials = yield* toGenerator(
      Keychain.getGenericPassword(KeychainStore.defaultOptions)
    );

    if (credentials) {
      const result = yield* toGenerator(
        this.keyRingStore.checkPassword(credentials.password)
      );
      if (result) {
        yield this.turnOnBiometry(credentials.password);
      }
      else {
        throw new Error(
          "Failed to get valid password from keychain. This may be due to changes of biometry information"
        );
      }
    } else {
      throw new Error("Failed to get credentials from keychain");
    }
  }

  @flow
  *turnOffBiometryWithoutReset() {
    const credentials = yield* toGenerator(
      Keychain.getGenericPassword(KeychainStore.defaultOptions)
    );
    if (credentials) {
      if (
        yield* toGenerator(
          this.keyRingStore.checkPassword(credentials.password)
        )
      ) {
        this._isBiometryOn = false;
        yield this.save();
      } else {
        throw new Error(
          "Failed to get valid password from keychain. This may be due to changes of biometry information"
        );
      }
    } else {
      throw new Error("Failed to get credentials from keychain");
    }
  }

  @flow
  *turnOffBiometry() {
    if (this.isBiometryOn) {
      const credentials = yield* toGenerator(
        Keychain.getGenericPassword(KeychainStore.defaultOptions)
      );
      if (credentials) {
        if (
          yield* toGenerator(
            this.keyRingStore.checkPassword(credentials.password)
          )
        ) {
          const result = yield* toGenerator(
            Keychain.resetGenericPassword(KeychainStore.defaultOptions)
          );
          if (result) {
            this._isBiometryOn = false;
            yield this.save();
          }
        } else {
          throw new Error(
            "Failed to get valid password from keychain. This may be due to changes of biometry information"
          );
        }
      } else {
        throw new Error("Failed to get credentials from keychain");
      }
    }
  }

  @flow
  *turnOffBiometryWithPassword(password: string) {
    if (this.isBiometryOn) {
      if (yield* toGenerator(this.keyRingStore.checkPassword(password))) {
        const result = yield* toGenerator(
          Keychain.resetGenericPassword(KeychainStore.defaultOptions)
        );
        if (result) {
          this._isBiometryOn = false;
          yield this.save();
        }
      } else {
        throw new Error("Invalid password");
      }
    }
  }

  @flow
  *reset() {
    if (this.isBiometryOn) {
      const result = yield* toGenerator(
        Keychain.resetGenericPassword(KeychainStore.defaultOptions)
      );
      if (result) {
        this._isBiometryOn = false;
        yield this.save();
      }
    }
  }

  @flow
  protected *init() {
    // No need to await.
    this.restore();

    const type = yield* toGenerator(
      Keychain.getSupportedBiometryType(KeychainStore.defaultOptions)
    );
    this._isBiometrySupported = type != null;
    this._isBiometryType = type ?? undefined;
  }

  @flow
  protected *restore() {
    const saved = yield* toGenerator(this.kvStore.get("isBiometryOn"));
    this._isBiometryOn = saved === true;
  }

  protected async save() {
    await this.kvStore.set("isBiometryOn", this.isBiometryOn);
  }

  protected async hasEnabledBiometricsFirstTime() {
    return await this.kvStore.get("hasEnabledBiometricsFirstTime");
  }

  protected async setHasEnabledBiometricsFirstTime() {
    await this.kvStore.set("hasEnabledBiometricsFirstTime", true);
  }
}
