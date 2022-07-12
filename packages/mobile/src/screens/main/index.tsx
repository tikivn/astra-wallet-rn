import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import {
  AppState,
  AppStateStatus,
  ImageBackground,
  RefreshControl,
  ScrollView,
  View,
  SafeAreaView,
  Text,
} from "react-native";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";

import { observer } from "mobx-react-lite";

import { usePrevious } from "../../hooks";
import { useFocusEffect } from "@react-navigation/native";
import { ChainUpdaterService } from "@keplr-wallet/background";
import { AccountCardNew, ActionsCard, BalanceCard } from "./card";
import { ScanIcon } from "../../components";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSmartNavigation } from "../../navigation";

export const MainScreen: FunctionComponent = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);

  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const style = useStyle();

  const scrollViewRef = useRef<ScrollView | null>(null);

  const currentChain = chainStore.current;
  const currentChainId = currentChain.chainId;
  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(
    chainStoreIsInitializing,
    true
  );

  const checkAndUpdateChainInfo = useCallback(() => {
    if (!chainStoreIsInitializing) {
      (async () => {
        const result = await ChainUpdaterService.checkChainUpdate(currentChain);

        // TODO: Add the modal for explicit chain update.
        if (result.slient) {
          chainStore.tryUpdateChain(currentChainId);
        }
      })();
    }
  }, [chainStore, chainStoreIsInitializing, currentChain, currentChainId]);

  useEffect(() => {
    const appStateHandler = (state: AppStateStatus) => {
      if (state === "active") {
        checkAndUpdateChainInfo();
      }
    };

    AppState.addEventListener("change", appStateHandler);

    return () => {
      AppState.removeEventListener("change", appStateHandler);
    };
  }, [checkAndUpdateChainInfo]);

  useFocusEffect(
    useCallback(() => {
      if (
        (chainStoreIsInitializing !== previousChainStoreIsInitializing &&
          !chainStoreIsInitializing) ||
        currentChainId !== previousChainId
      ) {
        checkAndUpdateChainInfo();
      }
    }, [
      chainStoreIsInitializing,
      previousChainStoreIsInitializing,
      currentChainId,
      previousChainId,
      checkAndUpdateChainInfo,
    ])
  );

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0 });
    }
  }, [chainStore.current.chainId]);

  const onRefresh = React.useCallback(async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    await Promise.all([
      priceStore.waitFreshResponse(),
      ...queries.queryBalances
        .getQueryBech32Address(account.bech32Address)
        .balances.map((bal) => {
          return bal.waitFreshResponse();
        }),
      queries.cosmos.queryRewards
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryUnbondingDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
    ]);

    setRefreshing(false);
  }, [accountStore, chainStore, priceStore, queriesStore]);

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );
  const smartNavigation = useSmartNavigation();

  return (
    <View style={style.get("background-color-background")}>
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        source={require("../../assets/logo/main_background.png")}
        resizeMode="contain"
      >
        <PageWithScrollViewInBottomTabView
          style={style.flatten(["margin-top-44"])}
          backgroundColor={style.get("color-transparent").color}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ref={scrollViewRef}
        >
          <View style={style.flatten(["height-44", "width-44", "self-end"])}>
            <TouchableOpacity
              style={style.flatten(["width-32", "height-32"])}
              onPress={() => {
                smartNavigation.navigateSmart("Camera", {});
              }}
            >
              <ScanIcon size={32} color={style.get("color-gray-10").color} />
            </TouchableOpacity>
          </View>
          <AccountCardNew
            containerStyle={style.get("background-color-transparent")}
          />
          <ActionsCard
            containerStyle={style.flatten([
              "background-color-transparent",
              "margin-top-16",
            ])}
          />
          <BalanceCard
            containerStyle={style.get("background-color-transparent")}
          />
        </PageWithScrollViewInBottomTabView>
      </ImageBackground>
    </View>
  );
});
