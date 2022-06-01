import React, {
    FunctionComponent,
    useCallback,
    useEffect,
} from "react";
import {
    AppState,
    AppStateStatus,
    RefreshControl,
    View,
    Text,
    TouchableHighlight,
    FlatList,
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
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as WebBrowser from "expo-web-browser";

export type PageRequestInfo = {
    currentPage: number,
    maxPage: number,
    limit: number
}

export const HistoryScreen: FunctionComponent = observer(() => {
    const [refreshing, setRefreshing] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [ pageInfo, setPageInfo ] = React.useState({
        currentPage: 0,
        maxPage: 1,
        limit: 100
    });

    const { chainStore, accountStore, queriesStore, priceStore } = useStore();

    const style = useStyle();

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

    // useEffect(() => {
    //     if (scrollViewRef.current) {
    //         scrollViewRef.current.scrollTo({ y: 0 });
    //     }
    // }, [chainStore.current.chainId]);


    const queriesForPage = (queries, bech32Address, page): any[] => {
        let limit = pageInfo.limit
        let sent = queries.cosmos.queryTxs.getQueryBech32Address(bech32Address, true, { offset: `${page * limit}`, limit: limit.toString() })
        let received = queries.cosmos.queryTxs.getQueryBech32Address(bech32Address, false, { offset: `${page * limit}`, limit: limit.toString() })
        return [sent, received]
    }

    const fetchPageData = (pageQueries): Promise => {
        return Promise.all(
            pageQueries.map((query) => query.waitFreshResponse())
        ).catch((reason) => {
            console.log(`call failed due ${reason}`);
        }).then((value) => {
            console.log(`call done ${value}`);
        });
    } 

    const onRefresh = React.useCallback(async () => {
        const chainId = chainStore.current.chainId
        const account = accountStore.getAccount(chainId);
        const bech32Address = account.bech32Address;
        // Because the components share the states related to the queries,
        // fetching new query responses here would make query responses on all other components also refresh.
        let pageQueries = queriesForPage(queriesStore.get(chainId), bech32Address, 0)

        await fetchPageData(pageQueries);
        let max: number = pageQueries.map((query) => query.total).reduce((max, current): number => {
            let queryTotal = Number.parseInt(current) || 0
            console.log(`max of ${max} ${queryTotal} ${typeof queryTotal}`)
            return Math.max(max, queryTotal)
        }, 0)
        pageInfo.currentPage = 0
        pageInfo.maxPage = Math.floor(max / pageInfo.limit)
        setPageInfo(pageInfo)
        console.log(`setTotal ${max} ${pageInfo.maxPage}`)
        
        setRefreshing(false);
    }, [accountStore, chainStore, priceStore, queriesStore]);

    const handleLoadMore = React.useCallback(async () => {
        console.log(`onLoadMore ${loading} cu=${pageInfo.currentPage} max=${pageInfo.maxPage}`)
        if (loading || pageInfo.currentPage >= pageInfo.maxPage) return
        setLoading(true)
        console.log(`onLoadMore setLoading true`)
        const chainId = chainStore.current.chainId
        const account = accountStore.getAccount(chainId);
        const bech32Address = account.bech32Address;
        let nextPage = pageInfo.currentPage + 1
        let pageQueries = queriesForPage(queriesStore.get(chainId), bech32Address, nextPage)

        await fetchPageData(pageQueries).then(() => {
            pageInfo.currentPage = nextPage;
            console.log(`handleLoadMore set nextPage ${nextPage}`);
        });
        setPageInfo(pageInfo)
        setLoading(false)
        console.log(`onLoadMore setLoading false`)
    }, [accountStore, chainStore, priceStore, queriesStore, pageInfo])

    const chainId = chainStore.current.chainId
    const account = accountStore.getAccount(chainId);
    const bech32Address = account.bech32Address;
    const queries = queriesStore.get(chainId);

    console.log(`chainId=${chainId} add=${bech32Address}`);

    const bottomTabBarHeight = useBottomTabBarHeight();

    const histories = (() => {
        let pageQueries = []
        let txResponses: TxResponse[] = []
        for (let p = 0; p <= pageInfo.currentPage; p++) {
            pageQueries.push(...queriesForPage(queries, bech32Address, p))
        }
        pageQueries.forEach((query) => txResponses.push(...query.txResponses))
        
        const histories = txResponses.sort((lh, rh) => rh.timestamp.localeCompare(lh.timestamp))
            .map((txResponse, index) => {
                let item = toUiItem(bech32Address, txResponse)
                // TODO for test
                item.action = `${index}.${item.action}`
                return item
            });
        console.log(`hisories Size + ${histories.length} page =${pageInfo.currentPage} max=${pageInfo.maxPage}`);
        const appCurrencies = chainStore.current.currencies;
        console.log("hisories currency " + appCurrencies.map((cur) => `${cur.coinDenom},${cur.coinMinimalDenom},${cur.coinDecimals}`).join());
        return histories
    })();

    return <View style={style.flatten(["padding-x-page", "flex-grow-1", "background-color-background"])} >
    <FlatList
        style={ { marginBottom: bottomTabBarHeight, flex: 1 }}
        data={histories}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
            <Text style={style.flatten(["color-text-black-low", "text-left", "padding-3", "body3", "flex-1"])} >
                Không tìm thấy giao dịch nào trong quá khứ.\n
                Bạn hãy kéo refresh để tải lại dữ liệu hoặc thử lại sau một lúc.
            </Text>
        }
        ItemSeparatorComponent={() =>
            <View style={{ flex: 0, height: 1, backgroundColor: '#2C364F', marginVertical: 16 }} />
        }
        ListFooterComponent={
            <View style={{flex: 1}}>
                {loading && (
                    <Text style={style.flatten(["color-text-black-low", "text-center", "padding-3", "body3", "flex-1"])} >
                        Loading...
                    </Text>
                )}
            </View>
        }
        onEndReached={handleLoadMore}
        keyExtractor={(_item, index) => `transaction_${index}`}
        renderItem={({ item }) => <TouchableHighlight
                onPress={() => {
                    let txExplorer = chainStore.getChain(chainId).raw.txExplorer;
                    let txHash = item.raw?.txhash;
                    if (txExplorer && txHash) {
                        let url = txExplorer.txUrl.replace("{txHash}", txHash.toUpperCase())
                        // Linking.openURL(url);
                        WebBrowser.openBrowserAsync(url);
                    }
                }}
            >
                <TransactionItem item={item} chainStore={chainStore} />
            </TouchableHighlight>
        }
    />
    </View>
});

