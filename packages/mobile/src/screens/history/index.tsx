import React, { FunctionComponent, useCallback, useEffect } from "react";
import {
  AppState,
  AppStateStatus,
  RefreshControl,
  View,
  Text,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";

import { observer } from "mobx-react-lite";

import { usePrevious } from "../../hooks";
import { useFocusEffect } from "@react-navigation/native";
import { ChainUpdaterService } from "@keplr-wallet/background";
import { toUiItem } from "./transaction_adapter";
import { TransactionItem } from "./transaction_history_item";
import { TxResponse } from "@keplr-wallet/stores/build/query/cosmos/tx/types";
import { useSmartNavigation } from "../../navigation-util";
import { FormattedMessage, useIntl } from "react-intl";
import { RectButton } from "react-native-gesture-handler";
import { ObservableQueryTxsInner } from "@keplr-wallet/stores";

export type PageRequestInfo = {
  currentPage: number;
  maxPage: number;
  limit: number;
};

export const HistoryScreen: FunctionComponent = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [pageInfo, setPageInfo] = React.useState({
    currentPage: 0,
    maxPage: 1,
    limit: 100,
  });

  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const style = useStyle();
  const intl = useIntl();

  const currentChain = chainStore.current;
  const currentChainId = currentChain.chainId;
  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(
    chainStoreIsInitializing,
    true
  );

  const smartNavigation = useSmartNavigation();
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

  const queriesForPage = (
    queries,
    bech32Address: string,
    page: number
  ): any[] => {
    const limit = pageInfo.limit;
    const sent = queries.cosmos.queryTxs.getQueryBech32Address(
      bech32Address,
      true,
      { offset: `${page * limit}`, limit: limit.toString() }
    );
    const received = queries.cosmos.queryTxs.getQueryBech32Address(
      bech32Address,
      false,
      { offset: `${page * limit}`, limit: limit.toString() }
    );
    return [sent, received];
  };

  const fetchPageData = (pageQueries): Promise => {
    return Promise.all(pageQueries.map((query) => query.waitFreshResponse()))
      .catch(() => {})
      .then(() => {});
  };

  const onRefresh = React.useCallback(async () => {
    const chainId = chainStore.current.chainId;
    const account = accountStore.getAccount(chainId);
    const bech32Address = account.bech32Address;
    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.
    const pageQueries = queriesForPage(
      queriesStore.get(chainId),
      bech32Address,
      0
    );

    await fetchPageData(pageQueries);
    const max: number = pageQueries
      .map((query) => query.total)
      .reduce((max, current): number => {
        const queryTotal = Number.parseInt(current) || 0;
        return Math.max(max, queryTotal);
      }, 0);
    pageInfo.currentPage = 0;
    pageInfo.maxPage = Math.floor(max / pageInfo.limit);
    setPageInfo(pageInfo);

    setRefreshing(false);
  }, [accountStore, chainStore, priceStore, queriesStore]);

  const handleLoadMore = React.useCallback(async () => {
    if (loading || pageInfo.currentPage >= pageInfo.maxPage) return;
    setLoading(true);
    const chainId = chainStore.current.chainId;
    const account = accountStore.getAccount(chainId);
    const bech32Address = account.bech32Address;
    const nextPage = pageInfo.currentPage + 1;
    const pageQueries = queriesForPage(
      queriesStore.get(chainId),
      bech32Address,
      nextPage
    );

    await fetchPageData(pageQueries).then(() => {
      pageInfo.currentPage = nextPage;
    });
    setPageInfo(pageInfo);
    setLoading(false);
  }, [accountStore, chainStore, priceStore, queriesStore, pageInfo]);

  const chainId = chainStore.current.chainId;
  const account = accountStore.getAccount(chainId);
  const bech32Address = account.bech32Address;
  const queries = queriesStore.get(chainId);

  const histories = (() => {
    const pageQueries: { txResponses: TxResponse[] }[] = [];
    const txResponses: TxResponse[] = [];
    for (let p = 0; p <= pageInfo.currentPage; p++) {
      pageQueries.push(...queriesForPage(queries, bech32Address, p));
    }
    pageQueries.forEach((query) => {
      return txResponses.push(
        ...query.txResponses.filter((txResponse) => {
          return (
            txResponses
              .map((txResponse) => txResponse.txhash)
              .indexOf(txResponse.txhash) === -1
          );
        })
      );
    });

    const histories = txResponses
      .sort((lh, rh) => rh.timestamp.localeCompare(lh.timestamp))
      .map((txResponse) => toUiItem(intl, bech32Address, txResponse));
    return histories;
  })();

  return (
    <View
      style={style.flatten([
        "padding-x-page",
        "flex-grow-1",
        "background-color-background",
      ])}
    >
      <FlatList
        style={style.flatten(["flex-1"])}
        data={histories}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text
            style={style.flatten([
              "color-text-black-low",
              "text-left",
              "padding-3",
              "body3",
              "flex-1",
            ])}
          >
            <FormattedMessage id="history.emptyHistory" />
          </Text>
        }
        ItemSeparatorComponent={() => (
          <View
            style={style.flatten(["height-1", "background-color-gray-70"])}
          />
        )}
        ListFooterComponent={
          <View style={{ flex: 1 }}>
            {loading && (
              <Text
                style={style.flatten([
                  "color-text-black-low",
                  "text-center",
                  "padding-3",
                  "body3",
                  "flex-1",
                ])}
              >
                <FormattedMessage id="common.loading" />
              </Text>
            )}
          </View>
        }
        onEndReached={handleLoadMore}
        keyExtractor={(_item, index) => `transaction_${index}`}
        renderItem={({ item }) => (
          <RectButton
            style={style.flatten(["margin-y-16"])}
            activeOpacity={0}
            onPress={() => {
              const txExplorer = chainStore.getChain(chainId).raw.txExplorer;
              const txHash = item.raw?.txhash;
              if (txExplorer && txHash) {
                const url = txExplorer.txUrl.replace(
                  "{txHash}",
                  txHash.toUpperCase()
                );
                smartNavigation.navigateSmart("WebView", {
                  url: url,
                });
              }
            }}
          >
            <TransactionItem item={item} chainStore={chainStore} />
          </RectButton>
        )}
      />
      <View style={style.flatten(["height-44"])} />
      <SafeAreaView />
    </View>
  );
});
