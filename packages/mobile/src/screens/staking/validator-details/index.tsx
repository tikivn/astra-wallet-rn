import { Dec } from "@keplr-wallet/unit";
import { useRoute, RouteProp } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useRef, useState } from "react";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { CommissionsCard } from "./commission-card";
import { ValidatorNameCard } from "./name-card";
import { DelegatedCard } from "./delegated-card";
import { Animated, Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { UnbondingCard } from "./unbonding-card";
import { DelegationsEmptyItem } from "../dashboard/delegate";
import { useIntl } from "react-intl";
import { ScrollView } from "react-native-gesture-handler";
import { ValidatorHeaderCard } from "./header-card";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ValidatorDetailsScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const safeAreaInsets = useSafeAreaInsets();
  const height = 44 + safeAreaInsets.top;
  const validatorAddress = route.params.validatorAddress;

  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const unbonding = queries.cosmos
    .queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.find(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );

  const style = useStyle();
  const intl = useIntl();

  const hasStake = staked.toDec().gt(new Dec(0));
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: "first",
      title: intl.formatMessage({ id: "validator.details.about" }),
    },
    {
      key: "second",
      title: intl.formatMessage(
        { id: "validator.details.amountBeingWithdrawn" },
        { denom: staked.denom },
      ),
    },
  ]);

  const FirstRoute = () => (
    <CommissionsCard
      showStake={!hasStake}
      containerStyle={style.flatten([
        // "margin-y-card-gap",
        "background-color-transparent",
        "flex-1",
      ])}
      validatorAddress={validatorAddress}
    />
  );

  const SecondRoute = () => (
    <UnbondingCard
      containerStyle={style.flatten([
        // "margin-y-card-gap",
        "background-color-transparent",
        "flex-1",
      ])}
      validatorAddress={validatorAddress}
    />
  );
  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const onScrollContent = useCallback((e) => {
    opacityAnim.setValue(e.nativeEvent.contentOffset.y > 0 ? 255 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={style.flatten(["background-color-background", "flex-grow-1"])}>
      <View style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}>
        <Image
          resizeMode="contain"
          source={require("../../../assets/image/background_top.png")}
        />
      </View>
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={style.flatten(["flex-grow-1"])}
        onScroll={onScrollContent}
      >
        <ValidatorNameCard validatorAddress={validatorAddress} />
        {hasStake ? (
          <DelegatedCard
            containerStyle={style.flatten([
              "background-color-transparent",
              "padding-y-0",
              "margin-top-24",
            ])}
            validatorAddress={validatorAddress}
          />
        ) : [
          <View style={style.flatten(["height-1", "background-color-border", "margin-x-page", "margin-top-24"])} />
        ]}
        {(unbonding?.entries.length ?? 0) !== 0
          ? <TabView
            lazy
            renderLazyPlaceholder={() => (
              <DelegationsEmptyItem
                label={intl.formatMessage({
                  id: "validator.details.emptyWithdrawHistory",
                })}
                containerStyle={style.flatten([
                  "background-color-background",
                  "margin-y-32",
                  "flex-1",
                ])}
              />
            )}
            style={style.flatten([
              "margin-top-16",
              "height-600",
            ])}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                indicatorStyle={style.get("background-color-tab-icon-active")}
                //   scrollEnabled={true}
                style={style.flatten([
                  "background-color-transparent",
                  "border-width-bottom-1",
                  "border-color-border"
                ])}
                renderLabel={({ route, focused }) => (
                  <Text
                    style={style.flatten(
                      [
                        "text-base-regular",
                        "color-tab-icon-inactive",
                      ],
                      [
                        focused && "text-base-semi-bold",
                        focused && "color-tab-icon-active"
                      ]
                    )}
                  >
                    {` ${route.title} `/* add space to avoid text is truncated */}
                  </Text>
                )}
              />
            )}
          />
          : [
            FirstRoute()
          ]
        }
      </ScrollView>
      <ValidatorHeaderCard
        animOpacity={opacityAnim}
        containerStyle={{
          position: "absolute",
          width: "100%",
          height: height,
          backgroundColor: "transparent",
        }}
      />
    </View>
  );
});
