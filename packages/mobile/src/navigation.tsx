/* eslint-disable react/display-name */
import { KeyRingStatus } from "@keplr-wallet/background";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  DrawerActions,
  NavigationContainer,
  NavigationContainerRef,
  useNavigation,
} from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { BorderlessButton } from "react-native-gesture-handler";
import { DrawerContent } from "./components/drawer";
import {
  GovernanceDetailsScreen,
  GovernanceScreen,
} from "./screens/governance";
import { HomeScreen } from "./screens/home";
import { RegisterIntroScreen } from "./screens/register";
import { RegisterEndScreen } from "./screens/register/end";
import {
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "./screens/register/mnemonic";
import { RegisterNewUserScreen } from "./screens/register/new-user";
import { RegisterNotNewUserScreen } from "./screens/register/not-new-user";
import { SendScreen } from "./screens/send";
import { SettingScreen } from "./screens/setting";
import { SettingChainListScreen } from "./screens/setting/screens/chain-list";
import { SettingSelectAccountScreen } from "./screens/setting/screens/select-account";
import { ViewPrivateDataScreen } from "./screens/setting/screens/view-private-data";
import { SettingsScreen } from "./screens/settings";
import { WebScreen } from "./screens/web";
import { useStore } from "./stores";
import { useStyle } from "./styles";

import Bugsnag from "@bugsnag/react-native";
import { useIntl } from "react-intl";
import { BlurredBottomTabBar } from "./components/bottom-tabbar";
import {
  BlurredHeaderScreenOptionsPreset,
  getPlainHeaderScreenOptionsPresetWithBackgroundColor,
  HeaderLeftButton,
  HeaderRightButton,
  PlainHeaderScreenOptionsPreset,
  WalletHeaderScreenOptionsPreset,
} from "./components/header";
import { HeaderAddIcon } from "./components/header/icon";
import {
  ConnectIcon,
  HistoryTabbarIcon,
  HomeTabbarIcon,
  OpenDrawerIcon,
  ScanIcon,
  SettingTabbarIcon,
  StakeTabbarIcon,
} from "./components/icon";
import { SmartNavigatorProvider } from "./navigation-util";
import {
  FocusedScreenProvider,
  useFocusedScreen,
} from "./providers/focused-screen";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import { SwapProvider } from "./providers/swap/provider";
import { CameraScreen } from "./screens/camera";
import { HistoryScreen } from "./screens/history";
import { MainScreen } from "./screens/main";
import {
  ReceiveScreen,
  SendConfirmScreen,
  SendTokenScreen,
  SwapScreen,
} from "./screens/main/screens";
import { SwapConfirmScreen } from "./screens/main/screens/swap-confirm";
import { ManageWalletConnectScreen } from "./screens/manage-wallet-connect";
import {
  ImportFromExtensionIntroScreen,
  ImportFromExtensionScreen,
  ImportFromExtensionSetPasswordScreen,
} from "./screens/register/import-from-extension";
import { NewLedgerScreen } from "./screens/register/ledger";
import { NewPincodeScreen } from "./screens/register/pincode";
import { TorusSignInScreen } from "./screens/register/torus";
import { RegisterTutorialcreen } from "./screens/register/tutorial";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/screens/address-book";
import {
  SettingAddTokenScreen,
  SettingManageTokensScreen,
} from "./screens/setting/screens/token";
import { KeplrVersionScreen } from "./screens/setting/screens/version";
import {
  DeleteWalletScreen,
  EnterPincodeScreen,
  NewPasswordInputScreen,
  PasswordInputScreen,
} from "./screens/settings/screens";
import {
  DelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "./screens/stake";
import { RedelegateScreen } from "./screens/stake/redelegate";
import { UndelegateScreen } from "./screens/stake/undelegate";
import {
  NewStakingDashboardScreen,
  NewValidatorDetailsScreen,
  NewValidatorListScreen,
} from "./screens/staking";
import { StakingRewardScreen } from "./screens/staking/rewards";
import { UnbondingScreen } from "./screens/staking/unbonding";
import { TokensScreen } from "./screens/tokens";
import { TxResultScreen } from "./screens/tx-result";
import { UnlockScreen } from "./screens/unlock";
import { SessionProposalScreen } from "./screens/wallet-connect";
import { WebpageScreenScreenOptionsPreset } from "./screens/web/components/webpage-screen";
import { WebViewScreen } from "./screens/web/default";
import {
  AstranautWebpageScreen,
  JunoswapWebpageScreen,
  OsmosisFrontierWebpageScreen,
  OsmosisWebpageScreen,
  StargazeWebpageScreen,
  UmeeWebpageScreen,
} from "./screens/web/webpages";
import { SwapSuccessScreen } from "./screens/main/screens/swap-success";

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
  const style = useStyle();
  const intl = useIntl();
  return (
    <Stack.Navigator
      screenOptions={{
        ...WalletHeaderScreenOptionsPreset,
        headerStyle: style.get("background-color-background"),
        headerTitleStyle: style.flatten(["title2", "color-white"]),
        headerTitle: intl.formatMessage({ id: "history.headerTitle" }),
      }}
      initialRouteName="History"
      headerMode="screen"
    >
      <Stack.Screen
        options={
          {
            // headerRight: () => <HomeScreenHeaderRight />,
          }
        }
        name="History"
        component={HistoryScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();

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
          title: intl.formatMessage({ id: "register.tutorial.title" }),
        }}
        name="Register.Tutorial"
        component={RegisterTutorialcreen}
      />

      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "register.newUser.title" }),
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
          title: intl.formatMessage({ id: "register.newMnemonic.title" }),
        }}
        name="Register.NewMnemonic"
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "register.verifyMnemonic.title" }),
        }}
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "register.recoverMnemonic.title" }),
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
          title: intl.formatMessage({ id: "register.setPincode.title" }),
        }}
        name="Register.SetPincode"
        component={NewPincodeScreen}
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
};

export const StakingNavigation: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();
  return (
    <Stack.Navigator
      screenOptions={{
        ...WalletHeaderScreenOptionsPreset,
        headerStyle: style.get("background-color-background"),
        headerTitleStyle: style.flatten(["title2", "color-white"]),
        headerTitle: intl.formatMessage({ id: "staking.headerTitle" }),
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
};

export const OtherNavigation: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();

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
          title: intl.formatMessage({ id: "connectedApps.title" }),
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
    </Stack.Navigator>
  );
};

export const SwapNavigation: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();
  return (
    <SwapProvider>
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
            title: intl.formatMessage({ id: "wallet.swap.title" }),
          }}
          name="Swap.Home"
          component={SwapScreen}
        />
        <Stack.Screen
          options={{
            title: intl.formatMessage({ id: "wallet.swapConfirm.title" }),
          }}
          name="Swap.Confirm"
          component={SwapConfirmScreen}
        />
        <Stack.Screen
          options={{ title: "" }}
          name="Swap.Success"
          component={SwapSuccessScreen}
        />
      </Stack.Navigator>
    </SwapProvider>
  );
};
export const WalletNavigation: FunctionComponent = () => {
  const style = useStyle();
  const navigation = useNavigation();
  const intl = useIntl();
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
          title: intl.formatMessage({ id: "wallet.receive.title" }),
        }}
        name="Receive"
        component={ReceiveScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "wallet.send.title" }),
        }}
        name="Wallet.Send"
        component={SendTokenScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "wallet.sendConfirm.title" }),
        }}
        name="Wallet.SendConfirm"
        component={SendConfirmScreen}
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
          title: intl.formatMessage({ id: "viewPassphase.title" }),
        }}
        name="Settings.EnterPincode"
        component={EnterPincodeScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "changePassword.title" }),
        }}
        name="Settings.PasswordInput"
        component={PasswordInputScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "changePassword.title" }),
        }}
        name="Settings.NewPasswordInput"
        component={NewPasswordInputScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "deleteAccount.title" }),
        }}
        name="Settings.DeleteWallet"
        component={DeleteWalletScreen}
      />
      <Stack.Screen
        options={{
          // title: intl.formatMessage({ id: "validator.details.new.title" }),
          headerShown: false,
        }}
        name="Validator.Details.New"
        component={NewValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "validator.list.new.title" }),
        }}
        name="Validator.List.New"
        component={NewValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "staking.reward.title" }),
        }}
        name="Staking.Rewards"
        component={StakingRewardScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "delegate.title" }),
        }}
        name="Delegate"
        component={DelegateScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "undelegate.title" }),
        }}
        name="Undelegate"
        component={UndelegateScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "redelegate.title" }),
        }}
        name="Redelegate"
        component={RedelegateScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "unbonding.title" }),
        }}
        name="Unbonding"
        component={UnbondingScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "wallet.history.title" }),
        }}
        name="Wallet.History"
        component={HistoryScreen}
      />
      <Stack.Screen name="WebView" component={WebViewScreen} />
      <Stack.Screen
        name="Camera"
        options={{
          headerShown: false,
        }}
        component={CameraScreen}
      />
      <Stack.Screen
        name="SessionProposal"
        options={{
          title: "",
        }}
        component={SessionProposalScreen}
      />
      <Stack.Screen
        options={{
          title: "Add Token",
        }}
        name="Setting.AddToken"
        component={SettingAddTokenScreen}
      />
      <Stack.Screen
        options={{
          title: "Manage Tokens",
          headerRight: () => (
            <HeaderRightButton
              onPress={() => {
                navigation.navigate("Setting.AddToken");
              }}
            >
              <HeaderAddIcon />
            </HeaderRightButton>
          ),
        }}
        name="Setting.ManageTokens"
        component={SettingManageTokensScreen}
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
      <Stack.Screen
        name="Web.OsmosisFrontier"
        component={OsmosisFrontierWebpageScreen}
      />
      <Stack.Screen name="Web.Stargaze" component={StargazeWebpageScreen} />
      <Stack.Screen name="Web.Astranaut" component={AstranautWebpageScreen} />
      <Stack.Screen name="Web.Umee" component={UmeeWebpageScreen} />
      <Stack.Screen name="Web.Junoswap" component={JunoswapWebpageScreen} />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();
  const { remoteConfigStore } = useStore();
  const dappsEnabled = remoteConfigStore.getBool("feature_dapps_enabled");

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const size = 24;
          switch (route.name) {
            case "NewMain":
              return <HomeTabbarIcon size={size} color={color} />;
            case "D-apps":
              return <ConnectIcon size={size} color={color} />;
            case "History":
              return <HistoryTabbarIcon size={size} color={color} />;
            case "Setting":
              return <SettingTabbarIcon size={size} color={color} />;
            case "Stake":
              return <StakeTabbarIcon size={size} color={color} />;
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
          borderTopColor: "#303341", //style.get("border-color-border-white").borderColor,
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
          tabBarLabel: intl.formatMessage({ id: "tabs.main" }),
        }}
      />
      <Tab.Screen
        name="Stake"
        component={StakingNavigation}
        options={{
          tabBarLabel: intl.formatMessage({ id: "tabs.stake" }),
        }}
      />
      {dappsEnabled && (
        <Tab.Screen
          name="D-apps"
          component={WebNavigation}
          options={{
            tabBarLabel: intl.formatMessage({ id: "tabs.d-apps" }),
          }}
        />
      )}
      <Tab.Screen
        name="History"
        component={HistoryNavigation}
        options={{
          unmountOnBlur: true,
          tabBarLabel: intl.formatMessage({ id: "tabs.history" }),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingsStackScreen}
        options={{
          tabBarLabel: intl.formatMessage({ id: "tabs.setting" }),
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
  const {
    keyRingStore,
    analyticsStore,
    signInteractionStore,
    transactionStore,
  } = useStore();

  const navigationRef = useRef<NavigationContainerRef | null>(null);
  const routeNameRef = useRef<string | null>(null);
  useEffect(() => {
    if (signInteractionStore.waitingData) {
      console.log("__DEBUG__ waitingdata :", signInteractionStore.waitingData);
      console.log("__navigationRef.current__", navigationRef.current);
      console.log(
        "__navigationRef.current__route",
        navigationRef.current?.getCurrentRoute()
      );
      transactionStore.updateTxState("pending");

      navigationRef.current?.navigate("Tx", {
        screen: "Tx.Result",
        params: {
          txState: "pending",
        },
      });
    }
  }, [signInteractionStore.waitingData, transactionStore]);

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
              <Stack.Screen name="Swap" component={SwapNavigation} />

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
