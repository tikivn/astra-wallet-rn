import { BIP44HDPath, ExportKeyRingData } from "@keplr-wallet/background";
import {
  RegisterConfig,
  AddressBookData,
  IRecipientConfig,
  IMemoConfig,
  AddressBookConfig,
} from "@keplr-wallet/hooks";
import { SignClientTypes } from "@walletconnect/types";
import { createSmartNavigatorProvider, SmartNavigator } from "./hooks";
import { NewMnemonicConfig } from "./screens/register/mnemonic";

const {
  SmartNavigatorProvider,
  useSmartNavigation,
} = createSmartNavigatorProvider(
  new SmartNavigator({
    "Register.Intro": {
      upperScreenName: "Register",
    },
    "Register.NewUser": {
      upperScreenName: "Register",
    },
    "Register.NotNewUser": {
      upperScreenName: "Register",
    },
    "Register.NewMnemonic": {
      upperScreenName: "Register",
    },
    "Register.VerifyMnemonic": {
      upperScreenName: "Register",
    },
    "Register.RecoverMnemonic": {
      upperScreenName: "Register",
    },
    "Register.NewLedger": {
      upperScreenName: "Register",
    },
    "Register.TorusSignIn": {
      upperScreenName: "Register",
    },
    "Register.ImportFromExtension.Intro": {
      upperScreenName: "Register",
    },
    "Register.ImportFromExtension": {
      upperScreenName: "Register",
    },
    "Register.ImportFromExtension.SetPassword": {
      upperScreenName: "Register",
    },
    "Register.End": {
      upperScreenName: "Register",
    },
    "Register.Tutorial": {
      upperScreenName: "Register",
    },
    "Register.SetPincode": {
      upperScreenName: "Register",
    },
    "Register.VerifyPincode": {
      upperScreenName: "Register",
    },
    Home: {
      upperScreenName: "Main",
    },
    Receive: {
      upperScreenName: "Wallet",
    },
    "Wallet.Send": {
      upperScreenName: "Wallet",
    },
    "Wallet.SendConfirm": {
      upperScreenName: "Wallet",
    },
    Swap: {
      upperScreenName: "Wallet",
    },
    NewHome: {
      upperScreenName: "NewMain",
    },
    Send: {
      upperScreenName: "Others",
    },
    Tokens: {
      upperScreenName: "Others",
    },

    ManageWalletConnect: {
      upperScreenName: "Others",
    },
    "Staking.Dashboard": {
      upperScreenName: "Others",
    },
    "Validator.Details": {
      upperScreenName: "Others",
    },
    "Validator.List": {
      upperScreenName: "Others",
    },
    Delegate: {
      upperScreenName: "Wallet",
    },
    Undelegate: {
      upperScreenName: "Wallet",
    },
    Redelegate: {
      upperScreenName: "Wallet",
    },
    Governance: {
      upperScreenName: "Others",
    },
    "Governance Details": {
      upperScreenName: "Others",
    },
    Setting: {
      upperScreenName: "Settings",
    },
    SettingSelectAccount: {
      upperScreenName: "Settings",
    },
    "Setting.ViewPrivateData": {
      upperScreenName: "Wallet",
    },
    "Setting.Version": {
      upperScreenName: "Settings",
    },
    "Setting.ChainList": {
      upperScreenName: "ChainList",
    },
    "Setting.AddToken": {
      upperScreenName: "Others",
    },
    "Setting.ManageTokens": {
      upperScreenName: "Others",
    },
    AddressBook: {
      upperScreenName: "AddressBooks",
    },
    AddAddressBook: {
      upperScreenName: "AddressBooks",
    },
    Result: {
      upperScreenName: "Others",
    },
    "Web.Intro": {
      upperScreenName: "Web",
    },
    "Web.Osmosis": {
      upperScreenName: "Web",
    },
    "Web.OsmosisFrontier": {
      upperScreenName: "Web",
    },
    "Web.Stargaze": {
      upperScreenName: "Web",
    },
    "Web.Astranaut": {
      upperScreenName: "Web",
    },
    "Settings.EnterPincode": {
      upperScreenName: "Wallet",
    },
    "Settings.PasswordInput": {
      upperScreenName: "Wallet",
    },
    "Settings.NewPasswordInput": {
      upperScreenName: "Wallet",
    },
    "Settings.DeleteWallet": {
      upperScreenName: "Wallet",
    },
    "Staking.Dashboard.New": {
      upperScreenName: "Stake",
    },
    "Validator.Details.New": {
      upperScreenName: "Wallet",
    },
    "Validator.List.New": {
      upperScreenName: "Wallet",
    },
    "Staking.Rewards": {
      upperScreenName: "Wallet",
    },
    Unbonding: {
      upperScreenName: "Wallet",
    },
    "Wallet.History": {
      upperScreenName: "Wallet",
    },
    History: {
      upperScreenName: "History",
    },
    WebView: {
      upperScreenName: "Wallet",
    },
    "Tx.Result": {
      upperScreenName: "Tx",
    },
    Camera: {
      upperScreenName: "Wallet",
    },
    SessionProposal: {
      upperScreenName: "Wallet",
    },
    "Web.Umee": {
      upperScreenName: "Web",
    },
    "Web.Junoswap": {
      upperScreenName: "Web",
    },
  }).withParams<{
    "Register.NewMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.VerifyMnemonic": {
      registerConfig: RegisterConfig;
      newMnemonicConfig: NewMnemonicConfig;
      bip44HDPath: BIP44HDPath;
    };
    "Register.SetPincode": {
      registerConfig: RegisterConfig;
      newMnemonicConfig: NewMnemonicConfig;
      bip44HDPath: BIP44HDPath;
      type: "new" | "restore";
    };
    "Register.VerifyPincode": {
      registerConfig: RegisterConfig;
      newMnemonicConfig: NewMnemonicConfig;
      bip44HDPath: BIP44HDPath;
      password: string;
      type: "new" | "restore";
    };
    "Register.RecoverMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.NewLedger": {
      registerConfig: RegisterConfig;
    };
    "Register.TorusSignIn": {
      registerConfig: RegisterConfig;
      type: "google" | "apple";
    };
    "Register.ImportFromExtension.Intro": {
      registerConfig: RegisterConfig;
    };
    "Register.ImportFromExtension": {
      registerConfig: RegisterConfig;
    };
    "Register.ImportFromExtension.SetPassword": {
      registerConfig: RegisterConfig;
      exportKeyRingDatas: ExportKeyRingData[];
      addressBooks: { [chainId: string]: AddressBookData[] | undefined };
    };
    "Register.End": {
      password?: string;
    };
    Send: {
      chainId?: string;
      currency?: string;
      recipient?: string;
    };
    "Validator.Details": {
      validatorAddress: string;
    };
    "Validator.Details.New": {
      validatorAddress: string;
    };
    "Validator.List": {
      validatorSelector?: (validatorAddress: string) => void;
    };
    "Validator.List.New": {
      validatorSelector?: (validatorAddress: string) => void;
    };
    Delegate: {
      validatorAddress: string;
    };
    Undelegate: {
      validatorAddress: string;
    };
    Redelegate: {
      validatorAddress: string;
    };
    "Governance Details": {
      proposalId: string;
    };
    "Setting.ViewPrivateData": {
      privateData: string;
      privateDataType: string;
    };
    "Settings.PasswordInput": {
      nextScreen: string;
      forwardPassword: boolean;
    };
    "Settings.NewPasswordInput": {
      currentPassword: string;
    };
    Setting: {
      floatAlert?: {
        type: "info" | "success" | "warning" | "error";
        content: string;
      };
    };
    AddressBook: {
      recipientConfig?: IRecipientConfig;
      memoConfig?: IMemoConfig;
    };
    AddAddressBook: {
      chainId: string;
      addressBookConfig: AddressBookConfig;
    };
    "Wallet.Send": {
      chainId?: string;
      currency?: string;
      recipient?: string;
    };
    WebView: {
      url?: string;
    };
    SessionProosal: {
      proposal: SignClientTypes.EventArguments["session_proposal"];
    };
  }>()
);

export { useSmartNavigation, SmartNavigatorProvider };
