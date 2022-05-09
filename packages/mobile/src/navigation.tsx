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
import { OpenDrawerIcon, ScanIcon } from "./components/icon";
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
} from "./components/header";
import { TokensScreen } from "./screens/tokens";
import { UndelegateScreen } from "./screens/stake/undelegate";
import { RedelegateScreen } from "./screens/stake/redelegate";
import { CameraScreen } from "./screens/camera";
import {
  FocusedScreenProvider,
  useFocusedScreen,
} from "./providers/focused-screen";
import Svg, { Path, Rect } from "react-native-svg";
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen,
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
    Home: {
      upperScreenName: "Main",
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
      upperScreenName: "Others",
    },
    Undelegate: {
      upperScreenName: "Others",
    },
    Redelegate: {
      upperScreenName: "Others",
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
      upperScreenName: "Settings",
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
  }).withParams<{
    "Register.NewMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.VerifyMnemonic": {
      registerConfig: RegisterConfig;
      newMnemonicConfig: NewMnemonicConfig;
      bip44HDPath: BIP44HDPath;
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
    "Validator.List": {
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

export const RegisterNavigation: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...PlainHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      initialRouteName="Register.Intro"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: "",
        }}
        name="Register.Intro"
        component={RegisterIntroScreen}
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
          title: "Create New Mnemonic",
        }}
        name="Register.NewMnemonic"
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: "Verify Mnemonic",
        }}
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: "Import Existing Wallet",
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
    </Stack.Navigator>
  );
};

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
          title: "Stake",
        }}
        name="Delegate"
        component={DelegateScreen}
      />
      <Stack.Screen
        options={{
          title: "Unstake",
        }}
        name="Undelegate"
        component={UndelegateScreen}
      />
      <Stack.Screen
        options={{
          title: "Switch Validator",
        }}
        name="Redelegate"
        component={RedelegateScreen}
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
        name="Setting.ViewPrivateData"
        component={ViewPrivateDataScreen}
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

  const navigation = useNavigation();

  const focusedScreen = useFocusedScreen();
  const isDrawerOpen = useIsDrawerOpen();

  useEffect(() => {
    // When the focused screen is not "Home" screen and the drawer is open,
    // try to close the drawer forcely.
    if (focusedScreen.name !== "Home" && isDrawerOpen) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  }, [focusedScreen.name, isDrawerOpen, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const size = 24;

          switch (route.name) {
            case "Tài sản":
              return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <Path fillRule="evenodd" clipRule="evenodd" 
                    d="M0.5 2.25012C0.5 1.00716 1.50704 0.00012207 2.75 0.00012207H13.25C13.6642 0.00012207 14 0.335908 14 0.750122V1.50012C14 1.91434 13.6642 2.25012 13.25 2.25012C12.8358 2.25012 12.5 1.91434 12.5 1.50012H2.75C2.33546 1.50012 2 1.83559 2 2.25012C2 2.66466 2.33546 3.00012 2.75 3.00012H16.25C16.6642 3.00012 17 3.33591 17 3.75012V8.25012H17.75C18.1642 8.25012 18.5 8.58591 18.5 9.00012V12.0001C18.5 12.4143 18.1642 12.7501 17.75 12.7501H17V17.2501C17 17.6643 16.6642 18.0001 16.25 18.0001H3.5C1.84304 18.0001 0.5 16.6571 0.5 15.0001V2.25012ZM17 11.2501V9.75012H14C13.5855 9.75012 13.25 10.0856 13.25 10.5001C13.25 10.9147 13.5855 11.2501 14 11.2501H17ZM15.5 8.25012H14C12.757 8.25012 11.75 9.25716 11.75 10.5001C11.75 11.7431 12.757 12.7501 14 12.7501H15.5V16.5001H3.5C2.67146 16.5001 2 15.8287 2 15.0001V4.37217L2.02823 4.38193C2.25478 4.45857 2.49752 4.50012 2.75 4.50012H15.5V8.25012Z" 
                    fill={color}
                    />
                </Svg>
              );
            case "Hoạt động":
              return (
                <Svg width={size} height={size} viewBox="0 0 24 24"  fill="none">
                  <Path d="M3 4.5H8.25V6H3V4.5Z" fill={color}/>
                  <Path d="M12 4.5H9.75V6H12V4.5Z" fill={color}/>
                  <Path d="M3 7.5H8.25V9H3V7.5Z" fill={color}/>
                  <Path d="M12 7.5H9.75V9H12V7.5Z" fill={color}/>
                  <Path d="M3 10.5H8.25V12H3V10.5Z" fill={color}/>
                  <Path d="M12 10.5H9.75V12H12V10.5Z" fill={color}/>
                  <Path fillRule="evenodd" clipRule="evenodd" d="M0 0.75C0 0.335786 0.335786 0 0.75 0H14.25C14.6642 0 15 0.335786 15 0.75V16.5C15 16.7766 14.8478 17.0307 14.6039 17.1613C14.36 17.2918 14.0641 17.2775 13.834 17.124L12 15.9014L10.166 17.124C9.9141 17.292 9.5859 17.292 9.33397 17.124L7.5 15.9014L5.66603 17.124C5.4141 17.292 5.0859 17.292 4.83397 17.124L3 15.9014L1.16603 17.124C0.935883 17.2775 0.639975 17.2918 0.396107 17.1613C0.152238 17.0307 0 16.7766 0 16.5V0.75ZM1.5 1.5V15.0986L2.58397 14.376C2.8359 14.208 3.1641 14.208 3.41602 14.376L5.25 15.5986L7.08397 14.376C7.3359 14.208 7.6641 14.208 7.91603 14.376L9.75 15.5986L11.584 14.376C11.8359 14.208 12.1641 14.208 12.416 14.376L13.5 15.0986V1.5H1.5Z" fill={color}/>
                </Svg>
              );
            case "Tài khoản":
              return (
                <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M8.5 1.5C6.84346 1.5 5.5 2.84346 5.5 4.5V5.25C5.5 6.90654 6.84346 8.25 8.5 8.25C10.1565 8.25 11.5 6.90654 11.5 5.25V4.5C11.5 2.84346 10.1565 1.5 8.5 1.5ZM4 4.5C4 2.01504 6.01504 0 8.5 0C10.985 0 13 2.01504 13 4.5V5.25C13 7.73496 10.985 9.75 8.5 9.75C6.01504 9.75 4 7.73496 4 5.25V4.5ZM3.00322 12.0654C4.45593 11.6689 6.46722 11.25 8.5 11.25C10.5327 11.25 12.5439 11.6688 13.9966 12.0653M3.00322 12.0654C1.37076 12.5102 0.25 13.9965 0.25 15.681V17.25C0.25 17.6642 0.585786 18 1 18H16C16.4142 18 16.75 17.6642 16.75 17.25V15.681C16.75 13.9965 15.629 12.5101 13.9966 12.0653M8.5 12.75C6.65388 12.75 4.78627 13.1336 3.398 13.5125C2.42521 13.7774 1.75 14.6657 1.75 15.681V16.5H15.25V15.681C15.25 14.6657 14.5752 13.7775 13.6024 13.5126C12.2142 13.1337 10.3461 12.75 8.5 12.75Z"
                        fill={color}
                  />
                </Svg>
              );
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
      <Tab.Screen name="Tài sản" component={MainNavigation} />
      <Tab.Screen name="Hoạt động" component={WebNavigation} />
      <Tab.Screen
        name="Tài khoản"
        component={SettingStackScreen}
        options={{
          unmountOnBlur: true,
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
  const { keyRingStore, analyticsStore } = useStore();

  const navigationRef = useRef<NavigationContainerRef | null>(null);
  const routeNameRef = useRef<string | null>(null);

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
                component={MainTabNavigationWithDrawer}
              />
              <Stack.Screen name="Register" component={RegisterNavigation} />
              <Stack.Screen name="Others" component={OtherNavigation} />
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
