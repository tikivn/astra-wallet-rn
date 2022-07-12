import { Dec } from "@keplr-wallet/unit";
import { useRoute, RouteProp } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { PageWithScrollView } from "../../../components/page";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { CommissionsCard } from "./commission-card";
import { ValidatorNameCard } from "./name-card";
import { DelegatedCard } from "./delegated-card";
import { ImageBackground, Text, View } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { UnbondingCard } from "./unbonding-card";
import { DelegationsEmptyItem } from "../dashboard/delegate";
import { useIntl } from "react-intl";

export const NewValidatorDetailsScreen: FunctionComponent = observer(() => {
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

  const validatorAddress = route.params.validatorAddress;

  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const style = useStyle();
  const intl = useIntl();

  const hasStake = staked.toDec().gt(new Dec(0));
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: intl.formatMessage({ id: "validator.details.about" }) },
    { key: "second", title: intl.formatMessage({ id: "validator.details.amountBeingWithdrawn" }) },
  ]);
  
  const FirstRoute = () => (
    <CommissionsCard
      showStake={!hasStake}
      containerStyle={style.flatten([
        "margin-y-card-gap",
        "background-color-transparent",
        "flex-1",
      ])}
      validatorAddress={validatorAddress}
    />
  );

  const SecondRoute = () => (
    <UnbondingCard
      containerStyle={style.flatten([
        "margin-y-card-gap",
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
  return (
    <View
      style={style.flatten([
        "width-full",
        "height-full",
        "background-color-background",
      ])}
    >
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        source={require("../../../assets/logo/main_background.png")}
        resizeMode="contain"
      >
        <PageWithScrollView
          contentContainerStyle={style.flatten(["flex-grow-1"])}
          backgroundColor={style.get("color-transparent").color}
          stickyHeaderIndices={[0]}
        >
          <ValidatorNameCard
            containerStyle={style.flatten([
              "margin-y-card-gap",
              "background-color-transparent",
            ])}
            validatorAddress={validatorAddress}
          />
          {hasStake ? (
            <DelegatedCard
              containerStyle={style.flatten([
                "background-color-transparent",
                "padding-y-0",
                "background-color-transparent",
              ])}
              validatorAddress={validatorAddress}
            />
          ) : null}
          <TabView
            lazy
            renderLazyPlaceholder={route => (
              <DelegationsEmptyItem
                label={intl.formatMessage({ id: "validator.details.emptyWithdrawHistory" })}
                containerStyle={style.flatten([
                  "background-color-background",
                  "margin-y-32",
                  "flex-1",
                ])}
              />
            )}
            style={style.flatten(["margin-top-16", "height-600"])}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={props => (
                <TabBar
                  {...props}
                  indicatorStyle={style.get("background-color-primary")}
                  tabStyle={style.flatten(["flex-0"])}
                //   scrollEnabled={true}
                  style={style.get("background-color-background")}
                  renderLabel={({route, focused}) => (
                    <Text style={style.flatten(["subtitle3", "color-gray-30"], [focused && "color-primary"])}>
                      {route.title}
                    </Text>
                  )}
                />
              )}
          />
        </PageWithScrollView>
      </ImageBackground>
    </View>
  );
});
