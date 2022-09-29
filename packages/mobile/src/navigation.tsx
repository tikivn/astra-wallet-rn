/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { KeyRingStatus } from "@keplr-wallet/background";
import {
  NavigationContainer,
  NavigationContainerRef,
  useNavigation,
} from "@react-navigation/native";
import { useStore } from "./stores";
import { observer } from "mobx-react-lite";
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
import { useStyle } from "./styles";
import { BorderlessButton } from "react-native-gesture-handler";
import { SettingsScreen } from "./screens/settings";
import { ViewPrivateDataScreen } from "./screens/settings/screens/view-private-data";
import { SettingChainListScreen } from "./screens/setting/screens/chain-list";
import { WebScreen } from "./screens/web";
import { RegisterIntroScreen } from "./screens/register";
import {
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "./screens/register/mnemonic";
import { RegisterEndScreen } from "./screens/register/end";
import { RegisterNewUserScreen } from "./screens/register/new-user";
import { RegisterNotNewUserScreen } from "./screens/register/not-new-user";

import {
  DelegateScreen,
  UndelegateScreen,
  RedelegateScreen,
  StakingDashboardScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
  StakingRewardScreen,
  UnbondingScreen,
} from "./screens/staking";
import {
  ConnectIcon,
  HistoryTabbarIcon,
  HomeTabbarIcon,
  SettingTabbarIcon,
  StakeTabbarIcon,
} from "./components/icon";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/screens/address-book";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import {
  BlurredHeaderScreenOptionsPreset,
  HeaderRightButton,
  WalletHeaderScreenOptionsPreset,
} from "./components/header";
import { TokensScreen } from "./screens/tokens";
import { CameraScreen } from "./screens/camera";
import { FocusedScreenProvider } from "./providers/focused-screen";
import { TxResultScreen } from "./screens/tx-result";
import { TorusSignInScreen } from "./screens/register/torus";
import { HeaderAddIcon } from "./components/header/icon";
import { BlurredBottomTabBar } from "./components/bottom-tabbar";
import { UnlockScreen } from "./screens/unlock";

import {
  SettingAddTokenScreen,
  SettingManageTokensScreen,
} from "./screens/setting/screens/token";
import { ManageWalletConnectScreen } from "./screens/manage-wallet-connect";
import {
  ImportFromExtensionIntroScreen,
  ImportFromExtensionScreen,
  ImportFromExtensionSetPasswordScreen,
} from "./screens/register/import-from-extension";
import { DappsWebpageScreen } from "./screens/web/webpages";
import { WebpageScreenScreenOptionsPreset } from "./screens/web/components/webpage-screen";
import Bugsnag from "@bugsnag/react-native";
import { MainScreen } from "./screens/main";
import {
  ReceiveScreen,
  SendConfirmScreen,
  SendTokenScreen,
  SwapScreen,
} from "./screens/main/screens";
import { RegisterTutorialcreen } from "./screens/register/tutorial";
import { NewPincodeScreen } from "./screens/register/pincode";
import {
  PasswordInputScreen,
  NewPasswordInputScreen,
} from "./screens/settings/screens";

import { HistoryScreen } from "./screens/history";
import { WebViewScreen } from "./screens/web/default";
import { SessionProposalScreen } from "./screens/wallet-connect";
import { useIntl } from "react-intl";
import { SmartNavigatorProvider } from "./navigation-util";
import { RegisterCreateEntryScreen } from "./screens/register/create-entry";
import { SwapConfirmScreen } from "./screens/main/screens/swap-confirm";
import { SwapProvider } from "./providers/swap/provider";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const NewMainNavigation: FunctionComponent = () => {
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
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
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName="History"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "history.headerTitle" }),
        }}
        name="History"
        component={HistoryScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
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
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "register.createEntry.nav.title" }),
        }}
        name="Register.CreateEntry"
        component={RegisterCreateEntryScreen}
      />
    </Stack.Navigator>
  );
};

export const TransactionNavigation: FunctionComponent = () => {
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
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
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName="Staking.Dashboard"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "staking.headerTitle" }),
        }}
        name="Staking.Dashboard"
        component={StakingDashboardScreen}
      />
    </Stack.Navigator>
  );
};

export const OtherNavigation: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} headerMode="screen">
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
    </Stack.Navigator>
  );
};

export const WalletNavigation: FunctionComponent = () => {
  const navigation = useNavigation();
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} headerMode="screen">
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
          title: intl.formatMessage({ id: "wallet.swap.title" }),
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
          // title: intl.formatMessage({ id: "validator.details.new.title" }),
          headerShown: false,
        }}
        name="Validator.Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "validator.list.new.title" }),
        }}
        name="Validator.List"
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "staking.reward.title" }),
        }}
        name="Staking.Rewards"
        component={StakingRewardScreen}
      />
      <Stack.Screen
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
      <Stack.Screen
        name="WebView"
        options={{
          title: "",
        }}
        component={WebViewScreen}
      />
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

export const SettingsStackScreen: FunctionComponent = () => {
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} headerMode="screen">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Setting"
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
};

export const SwapStackScreen: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <SwapProvider>
      <Stack.Navigator screenOptions={screenOptions} headerMode="screen">
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
      </Stack.Navigator>
    </SwapProvider>
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
      <Stack.Screen name="Web.Intro" component={WebScreen} />
      <Stack.Screen name="Web.Dapps" component={DappsWebpageScreen} />
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
        tabBarIcon: ({ focused }) => {
          const color = style.get(
            `color-tab-icon-${focused ? "active" : "inactive"}`
          ).color;
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
        tabBarLabel: ({ focused }) => {
          let name = "";
          switch (route.name) {
            case "NewMain":
              name = intl.formatMessage({ id: "tabs.main" });
              break;
            case "Stake":
              name = intl.formatMessage({ id: "tabs.stake" });
              break;
            case "D-apps":
              name = intl.formatMessage({ id: "tabs.d-apps" });
              break;
            case "History":
              name = intl.formatMessage({ id: "tabs.history" });
              break;
            case "Setting":
              name = intl.formatMessage({ id: "tabs.setting" });
              break;
          }
          return (
            <Text
              style={style.flatten([
                "text-x-small-medium",
                "text-center",
                `color-tab-text-${focused ? "active" : "inactive"}` as any,
              ])}
            >
              {name}
            </Text>
          );
        },
        tabBarButton: (props) => (
          <View
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderTopWidth: 2,
              borderColor:
                props.accessibilityState?.selected === true
                  ? style.get("color-tab-icon-active").color
                  : "transparent",
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
        style: {
          borderTopWidth: 1,
          borderTopColor: style.get("color-border").color,
          shadowColor: style.get("color-transparent").color,
          elevation: 0,
        },
        showLabel: true,
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={["Home"]} />
      )}
    >
      <Tab.Screen name="NewMain" component={NewMainNavigation} />
      <Tab.Screen name="Stake" component={StakingNavigation} />
      {dappsEnabled && <Tab.Screen name="D-apps" component={WebNavigation} />}
      <Tab.Screen
        name="History"
        component={HistoryNavigation}
        options={{
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen name="Setting" component={SettingsStackScreen} />
    </Tab.Navigator>
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
              <Stack.Screen name="Swap" component={SwapStackScreen} />
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
