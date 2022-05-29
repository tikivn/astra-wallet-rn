/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect, useRef } from "react";
import { Text, View } from "react-native";
import {
  BIP44HDPath,
  ExportKeyRingData,
  KeyRingStatus,
} from "@keplr-wallet/background";
import {
  DrawerActions,
  NavigationContainer,
  NavigationContainerRef,
  useNavigation,
} from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
import { HomeScreen } from "./screens/home";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { SendScreen } from "./screens/send";
import {
  GovernanceDetailsScreen,
  GovernanceScreen,
} from "./screens/governance";
import {
  createDrawerNavigator,
  useIsDrawerOpen,
} from "@react-navigation/drawer";
import { DrawerContent } from "./components/drawer";
import { useStyle } from "./styles";
import { BorderlessButton } from "react-native-gesture-handler";
import { createSmartNavigatorProvider, SmartNavigator } from "./hooks";
import { SettingScreen } from "./screens/setting";
import { SettingsScreen } from "./screens/settings";
import { SettingSelectAccountScreen } from "./screens/setting/screens/select-account";
import { ViewPrivateDataScreen } from "./screens/setting/screens/view-private-data";
import { SettingChainListScreen } from "./screens/setting/screens/chain-list";
import { WebScreen } from "./screens/web";
import { RegisterIntroScreen } from "./screens/register";
import {
  NewMnemonicConfig,
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "./screens/register/mnemonic";
import { RegisterEndScreen } from "./screens/register/end";
import { RegisterNewUserScreen } from "./screens/register/new-user";
import { RegisterNotNewUserScreen } from "./screens/register/not-new-user";
import {
  AddressBookConfig,
  AddressBookData,
  IMemoConfig,
  IRecipientConfig,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import {
  DelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "./screens/stake";
import { HistoryTabbarIcon, HomeTabbarIcon, OpenDrawerIcon, ScanIcon, SettingTabbarIcon, StakeTabbarIcon } from "./components/icon";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/screens/address-book";
import { NewLedgerScreen } from "./screens/register/ledger";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import {
  BlurredHeaderScreenOptionsPreset,
  getPlainHeaderScreenOptionsPresetWithBackgroundColor,
  HeaderLeftButton,
  HeaderRightButton,
  PlainHeaderScreenOptionsPreset,
  WalletHeaderScreenOptionsPreset,
} from "./components/header";
import { TokensScreen } from "./screens/tokens";
import { UndelegateScreen } from "./screens/stake/undelegate";
import { RedelegateScreen } from "./screens/stake/redelegate";
import { CameraScreen } from "./screens/camera";
import {
  FocusedScreenProvider,
  useFocusedScreen,
} from "./providers/focused-screen";
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen,
  TxResultScreen,
} from "./screens/tx-result";
import { TorusSignInScreen } from "./screens/register/torus";
import {
  HeaderAddIcon,
  HeaderWalletConnectIcon,
} from "./components/header/icon";
import { BlurredBottomTabBar } from "./components/bottom-tabbar";
import { UnlockScreen } from "./screens/unlock";
import { KeplrVersionScreen } from "./screens/setting/screens/version";
import { ManageWalletConnectScreen } from "./screens/manage-wallet-connect";
import {
  ImportFromExtensionIntroScreen,
  ImportFromExtensionScreen,
  ImportFromExtensionSetPasswordScreen,
} from "./screens/register/import-from-extension";
import {
  OsmosisWebpageScreen,
  StargazeWebpageScreen,
  AstranautWebpageScreen,
} from "./screens/web/webpages";
import { WebpageScreenScreenOptionsPreset } from "./screens/web/components/webpage-screen";
import Bugsnag from "@bugsnag/react-native";
import { MainScreen } from "./screens/main";
import { ReceiveScreen, SendConfirmScreen, SendTokenScreen, SwapScreen } from "./screens/main/screens";
import { RegisterTutorialcreen } from "./screens/register/tutorial";
import { NewPincodeScreen } from "./screens/register/pincode";
import { VerifyPincodeScreen } from "./screens/register/pincode/verify";
import { DeleteWalletScreen, EnterPincodeScreen } from "./screens/settings/screens";
import { NewStakingDashboardScreen, NewValidatorDetailsScreen, NewValidatorListScreen } from "./screens/staking";
import { StakingRewardScreen } from "./screens/staking/rewards";
import { HistoryScreen } from "./screens/history";
import { TxConfirmResultScreen } from "./screens/tx-result/confirm";
import { TxType } from "./stores/transaction";

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
    Camera: {
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
    AddressBook: {
      upperScreenName: "AddressBooks",
    },
    AddAddressBook: {
      upperScreenName: "AddressBooks",
    },
    Result: {
      upperScreenName: "Others",
    },
    TxPendingResult: {
      upperScreenName: "Others",
    },
    TxSuccessResult: {
      upperScreenName: "Others",
    },
    TxFailedResult: {
      upperScreenName: "Others",
    },
    "Web.Intro": {
      upperScreenName: "Web",
    },
    "Web.Osmosis": {
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
    }
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
    AddressBook: {
      recipientConfig?: IRecipientConfig;
      memoConfig?: IMemoConfig;
    };
    AddAddressBook: {
      chainId: string;
      addressBookConfig: AddressBookConfig;
    };
    TxPendingResult: {
      chainId?: string;
      txHash: string;
    };
    TxSuccessResult: {
      chainId?: string;
      txHash: string;
    };
    TxFailedResult: {
      chainId?: string;
      txHash: string;
    };
    "Wallet.Send": {
      chainId?: string;
      currency?: string;
      recipient?: string;
    };
  }>()
);

export { useSmartNavigation };

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const HomeScreenHeaderLeft: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  return (
    <HeaderLeftButton
      onPress={() => {
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}
    >
      <View style={style.flatten(["flex-row", "items-center"])}>
        <OpenDrawerIcon size={28} color={style.get("color-primary").color} />
        <Text
          style={style.flatten([
            "h4",
            "color-text-black-high",
            "margin-left-4",
          ])}
        >
          {chainStore.current.chainName}
        </Text>
      </View>
    </HeaderLeftButton>
  );
});

const HomeScreenHeaderRight: FunctionComponent = observer(() => {
  const { walletConnectStore } = useStore();

  const style = useStyle();

  const navigation = useNavigation();

  return (
    <React.Fragment>
      <HeaderRightButton
        onPress={() => {
          navigation.navigate("Others", {
            screen: "Camera",
          });
        }}
      >
        <ScanIcon size={28} color={style.get("color-primary").color} />
      </HeaderRightButton>
      {walletConnectStore.sessions.length > 0 ? (
        <HeaderRightButton
          style={{
            right: 42,
          }}
          onPress={() => {
            navigation.navigate("Others", {
              screen: "ManageWalletConnect",
            });
          }}
        >
          <HeaderWalletConnectIcon />
        </HeaderRightButton>
      ) : null}
    </React.Fragment>
  );
});

export const MainNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitle: "",
      }}
      initialRouteName="Home"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerLeft: () => <HomeScreenHeaderLeft />,
          headerRight: () => <HomeScreenHeaderRight />,
        }}
        name="Home"
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
};

export const NewMainNavigation: FunctionComponent = () => {
  const style = useStyle();
  return (
    <Stack.Navigator
      screenOptions={{
        ...WalletHeaderScreenOptionsPreset,
        headerStyle: style.get("background-color-background"),
        headerTitleStyle: style.flatten(["title2", "color-white"]),
      }}
      initialRouteName="NewHome"
      headerMode="screen"
    >
      <Stack.Screen
        name="NewHome"
        component={MainScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export const HistoryNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "left",
        headerStyle: {
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitle: "Lịch sử giao dịch",
        headerTitleStyle: {
          color: "white"
        }
      }}
      initialRouteName="History"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          // headerRight: () => <HomeScreenHeaderRight />,
        }}
        name="History"
        component={HistoryScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...WalletHeaderScreenOptionsPreset,
        headerStyle: style.get("background-color-background"),
        headerTitleStyle: style.flatten(["title2", "color-white"]),
      }}
      initialRouteName="Register.Intro"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerShown: false,
          title: "",
        }}
        name="Register.Intro"
        component={RegisterIntroScreen}
      />
      <Stack.Screen
        options={{
          title: "Tạo tài khoản mới",
        }}
        name="Register.Tutorial"
        component={RegisterTutorialcreen}
      />

      <Stack.Screen
        options={{
          title: "Create a New Wallet",
        }}
        name="Register.NewUser"
        component={RegisterNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: "Import Existing Wallet",
        }}
        name="Register.NotNewUser"
        component={RegisterNotNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: "Tạo tài khoản mới",
        }}
        name="Register.NewMnemonic"
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: "Tạo tài khoản mới",
        }}
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: "Khôi phục tài khoản đã có",
        }}
        name="Register.RecoverMnemonic"
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: "Import Hardware Wallet",
        }}
        name="Register.NewLedger"
        component={NewLedgerScreen}
      />
      <Stack.Screen name="Register.TorusSignIn" component={TorusSignInScreen} />
      <Stack.Screen
        options={{
          // Only show the back button.
          title: "",
        }}
        name="Register.ImportFromExtension.Intro"
        component={ImportFromExtensionIntroScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Register.ImportFromExtension"
        component={ImportFromExtensionScreen}
      />
      <Stack.Screen
        options={{
          title: "Import Extension",
        }}
        name="Register.ImportFromExtension.SetPassword"
        component={ImportFromExtensionSetPasswordScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Register.End"
        component={RegisterEndScreen}
      />
      <Stack.Screen
        options={{
          title: "Tạo tài khoản mới",
        }}
        name="Register.SetPincode"
        component={NewPincodeScreen}
      />
      <Stack.Screen
        options={{
          title: "Tạo tài khoản mới",
        }}
        name="Register.VerifyPincode"
        component={VerifyPincodeScreen}
      />
    </Stack.Navigator>
  );
};

export const TransactionNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...WalletHeaderScreenOptionsPreset,
        headerStyle: style.get("background-color-background"),
        headerTitleStyle: style.flatten(["title2", "color-white"]),
      }}
      headerMode="screen"
      initialRouteName="Tx.Result"
    >
      <Stack.Screen
        name="Tx.Result"
        component={TxResultScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export const StakingNavigation: FunctionComponent = () => {
  const style = useStyle();
  return (
    <Stack.Navigator
      screenOptions={{
        ...WalletHeaderScreenOptionsPreset,
        headerStyle: style.get("background-color-background"),
        headerTitleStyle: style.flatten(["title2", "color-white"]),
        headerTitle: "Staking",
      }}
      initialRouteName="Staking.Dashboard.New"
      headerMode="screen"
    >
      <Stack.Screen
        name="Staking.Dashboard.New"
        component={NewStakingDashboardScreen}
      />
    </Stack.Navigator>
  );
}

export const OtherNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: "Send",
        }}
        name="Send"
        component={SendScreen}
      />
      <Stack.Screen
        options={{
          title: "Tokens",
        }}
        name="Tokens"
        component={TokensScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Camera"
        component={CameraScreen}
      />
      <Stack.Screen
        options={{
          title: "WalletConnect",
        }}
        name="ManageWalletConnect"
        component={ManageWalletConnectScreen}
      />
      <Stack.Screen
        options={{
          title: "Validator List",
        }}
        name="Validator List"
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: "Validator Details",
        }}
        name="Validator Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: "Governance",
        }}
        name="Governance"
        component={GovernanceScreen}
      />
      <Stack.Screen
        options={{
          title: "Proposal",
        }}
        name="Governance Details"
        component={GovernanceDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: "Staking Dashboard",
        }}
        name="Staking.Dashboard"
        component={StakingDashboardScreen}
      />
      <Stack.Screen
        options={{
          title: "Validator Details",
        }}
        name="Validator.Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: "All Active Validators",
        }}
        name="Validator.List"
        component={ValidatorListScreen}
      />

      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name="TxPendingResult"
        component={TxPendingResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name="TxSuccessResult"
        component={TxSuccessResultScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
        name="TxFailedResult"
        component={TxFailedResultScreen}
      />
    </Stack.Navigator>
  );
};

export const WalletNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...WalletHeaderScreenOptionsPreset,
        headerStyle: style.get("background-color-background"),
        headerTitleStyle: style.flatten(["title2", "color-white"]),
      }}
      headerMode="screen"

    >
      <Stack.Screen
        options={{
          title: "Mã nhận Astra",
        }}
        name="Receive"
        component={ReceiveScreen}
      />
      <Stack.Screen
        options={{
          title: "Gửi Astra",
        }}
        name="Wallet.Send"
        component={SendTokenScreen}
      />
      <Stack.Screen
        options={{
          title: "Gửi Astra",
        }}
        name="Wallet.SendConfirm"
        component={SendConfirmScreen}
      />
      <Stack.Screen
        options={{
          title: "Swap Astra",
        }}
        name="Swap"
        component={SwapScreen}
      />
      <Stack.Screen
        options={{
          title: "",
        }}
        name="Setting.ViewPrivateData"
        component={ViewPrivateDataScreen}
      />

      <Stack.Screen
        options={{
          title: "",
        }}
        name="Settings.EnterPincode"
        component={EnterPincodeScreen} />
      <Stack.Screen
        options={{
          title: "",
        }}
        name="Settings.DeleteWallet"
        component={DeleteWalletScreen} />
      <Stack.Screen
        options={{
          title: "Quỹ đầu tư",
          headerShown: false
        }}
        name="Validator.Details.New"
        component={NewValidatorDetailsScreen} />
      <Stack.Screen
        options={{
          title: "Chọn quỹ đầu tư",
        }}
        name="Validator.List.New"
        component={NewValidatorListScreen} />
      <Stack.Screen
        options={{
          title: "Nhận tiền lãi",
        }}
        name="Staking.Rewards"
        component={StakingRewardScreen} />
      <Stack.Screen
        options={{
          title: "Nhập tiền đầu tư",
        }}
        name="Delegate"
        component={DelegateScreen}
      />
      <Stack.Screen
        options={{
          title: "Rút tiền đầu tư",
        }}
        name="Undelegate"
        component={UndelegateScreen}
      />
      <Stack.Screen
        options={{
          title: "Chuyển đổi quỹ",
        }}
        name="Redelegate"
        component={RedelegateScreen}
      />
    </Stack.Navigator>
  );
};

export const SettingStackScreen: FunctionComponent = () => {
  const style = useStyle();

  const navigation = useNavigation();

  const { analyticsStore } = useStore();

  return (
    <Stack.Navigator
      screenOptions={{
        ...PlainHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: "Settings",
          ...getPlainHeaderScreenOptionsPresetWithBackgroundColor(
            style.get("color-setting-screen-background").color
          ),
          headerTitleStyle: style.flatten(["h3", "color-text-black-high"]),
        }}
        name="Setting"
        component={SettingScreen}
      />
      <Stack.Screen
        name="SettingSelectAccount"
        options={{
          title: "Select Account",
          headerRight: () => (
            <HeaderRightButton
              onPress={() => {
                analyticsStore.logEvent("Add additional account started");
                navigation.navigate("Register", {
                  screen: "Register.Intro",
                });
              }}
            >
              <HeaderAddIcon />
            </HeaderRightButton>
          ),
          ...BlurredHeaderScreenOptionsPreset,
        }}
        component={SettingSelectAccountScreen}
      />

      <Stack.Screen
        options={{
          title: "Version",
        }}
        name="Setting.Version"
        component={KeplrVersionScreen}
      />
    </Stack.Navigator>
  );
};

export const SettingsStackScreen: FunctionComponent = () => {
  const style = useStyle();
  return (
    <Stack.Navigator
      screenOptions={{
        ...WalletHeaderScreenOptionsPreset,
        headerStyle: style.get("background-color-background"),
        headerTitleStyle: style.flatten(["title2", "color-white"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: false,
        }}
        name="Setting"
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
};

export const AddressBookStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: "Address Book",
        }}
        name="AddressBook"
        component={AddressBookScreen}
      />
      <Stack.Screen
        options={{
          title: "New Address Book",
        }}
        name="AddAddressBook"
        component={AddAddressBookScreen}
      />
    </Stack.Navigator>
  );
};

export const ChainListStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: "Chain List",
        }}
        name="Setting.ChainList"
        component={SettingChainListScreen}
      />
    </Stack.Navigator>
  );
};

export const WebNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      initialRouteName="Web.Intro"
      screenOptions={{
        ...WebpageScreenScreenOptionsPreset,
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name="Web.Intro"
        component={WebScreen}
      />
      <Stack.Screen name="Web.Osmosis" component={OsmosisWebpageScreen} />
      <Stack.Screen name="Web.Stargaze" component={StargazeWebpageScreen} />
      <Stack.Screen name="Web.Astranaut" component={AstranautWebpageScreen} />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();

  // const navigation = useNavigation();

  // const focusedScreen = useFocusedScreen();
  // const isDrawerOpen = useIsDrawerOpen();

  // useEffect(() => {
  //   // When the focused screen is not "Home" screen and the drawer is open,
  //   // try to close the drawer forcely.
  //   if (focusedScreen.name !== "Home" && isDrawerOpen) {
  //     navigation.dispatch(DrawerActions.toggleDrawer());
  //   }
  // }, [focusedScreen.name, isDrawerOpen, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const size = 24;
          switch (route.name) {
            case "NewMain":
              return <HomeTabbarIcon size={size} color={color} />
            case "Main":
              return <HomeTabbarIcon size={size} color={color} />
            case "History":
              return <HistoryTabbarIcon size={size} color={color} />
            case "Setting":
              return <SettingTabbarIcon size={size} color={color} />
            case "Stake":
              return <StakeTabbarIcon size={size} color={color} />
          }
        },
        tabBarButton: (props) => (
          <View
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <BorderlessButton
              {...props}
              activeOpacity={1}
              style={{
                height: "100%",
                aspectRatio: 1.9,
                maxWidth: "100%",
              }}
            />
          </View>
        ),
      })}
      tabBarOptions={{
        activeTintColor: style.get("color-primary").color,
        inactiveTintColor: style.get("color-text-black-very-very-low").color,
        style: {
          borderTopWidth: 0.5,
          borderTopColor: '#303341',//style.get("border-color-border-white").borderColor,
          shadowColor: style.get("color-transparent").color,
          elevation: 0,
          paddingLeft: 30,
          paddingRight: 30,
        },
        showLabel: true,
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={["Home"]} />
      )}
    >

      <Tab.Screen
        name="NewMain"
        component={NewMainNavigation}
        options={{
          tabBarLabel: "Tài sản",
        }}
      />
      <Tab.Screen
        name="Stake"
        component={StakingNavigation}
        options={{
          tabBarLabel: "Tiết kiệm",
        }} />
      <Tab.Screen
        name="History"
        component={HistoryNavigation}
        options={{
          unmountOnBlur: true,
          tabBarLabel: "Lịch sử",
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingsStackScreen}
        options={{
          tabBarLabel: "Cài đặt",
        }}
      />
    </Tab.Navigator>
  );
};

export const MainTabNavigationWithDrawer: FunctionComponent = () => {
  const focused = useFocusedScreen();

  return (
    <Drawer.Navigator
      drawerType="slide"
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        // If the focused screen is not "Home" screen,
        // disable the gesture to open drawer.
        swipeEnabled: focused.name === "Home",
        gestureEnabled: focused.name === "Home",
      }}
      gestureHandlerProps={{
        hitSlop: {},
      }}
    >
      <Drawer.Screen name="MainTab" component={MainTabNavigation} />
    </Drawer.Navigator>
  );
};

const BugsnagNavigationContainerPlugin = Bugsnag.getPlugin("reactNavigation");
// The returned BugsnagNavigationContainer has exactly the same usage
// except now it tracks route information to send with your error reports
const BugsnagNavigationContainer = (() => {
  if (BugsnagNavigationContainerPlugin) {
    console.log("BugsnagNavigationContainerPlugin found");
    return BugsnagNavigationContainerPlugin.createNavigationContainer(
      NavigationContainer
    );
  } else {
    console.log(
      "WARNING: BugsnagNavigationContainerPlugin is null. Fallback to use basic NavigationContainer"
    );
    return NavigationContainer;
  }
})();

export const AppNavigation: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore, signInteractionStore, transactionStore } = useStore();

  const navigationRef = useRef<NavigationContainerRef | null>(null);
  const routeNameRef = useRef<string | null>(null);

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      console.log("__navigationRef.current__", navigationRef.current);
      console.log("__navigationRef.current__route", navigationRef.current?.getCurrentRoute());

      const routeName = navigationRef.current?.getCurrentRoute()?.name || "";
      const txTypeMapping: Record<string, TxType> = {
        "Wallet.Send": "send",
        "Delegate": "delegate",
        "Staking.Rewards": "withdraw",
        // "Home": "withdraw",
        // "Staking.Dashboard": "withdraw",
        "Undelegate": "undelegate",
        "Redelegate": "redelegate",
      };

      transactionStore.updateTxType(txTypeMapping[routeName]);
      transactionStore.updateTxState("pending");

      navigationRef.current?.navigate("Tx", {
        screen: "Tx.Result",
        params: {
          txType: txTypeMapping[routeName],
          txState: "pending"
        },
      });
    }
  }, [signInteractionStore.waitingData]);

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
          <BugsnagNavigationContainer
            ref={navigationRef}
            onReady={() => {
              const routerName = navigationRef.current?.getCurrentRoute();
              if (routerName) {
                routeNameRef.current = routerName.name;

                analyticsStore.logPageView(routerName.name);
              }
            }}
            onStateChange={() => {
              const routerName = navigationRef.current?.getCurrentRoute();
              if (routerName) {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = routerName.name;

                if (previousRouteName !== currentRouteName) {
                  analyticsStore.logPageView(currentRouteName);
                }

                routeNameRef.current = currentRouteName;
              }
            }}
          >
            <Stack.Navigator
              initialRouteName={
                keyRingStore.status !== KeyRingStatus.UNLOCKED
                  ? "Unlock"
                  : "MainTabDrawer"
              }
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS,
              }}
              headerMode="screen"
            >
              <Stack.Screen name="Unlock" component={UnlockScreen} />
              <Stack.Screen
                name="MainTabDrawer"
                component={MainTabNavigation}
              />
              <Stack.Screen name="Register" component={RegisterNavigation} />
              <Stack.Screen name="Others" component={OtherNavigation} />
              <Stack.Screen name="Wallet" component={WalletNavigation} />
              <Stack.Screen name="Tx" component={TransactionNavigation} />
              <Stack.Screen
                name="AddressBooks"
                component={AddressBookStackScreen}
              />
              <Stack.Screen name="ChainList" component={ChainListStackScreen} />
            </Stack.Navigator>
          </BugsnagNavigationContainer>
          {/* <ModalsRenderer /> */}
        </SmartNavigatorProvider>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
