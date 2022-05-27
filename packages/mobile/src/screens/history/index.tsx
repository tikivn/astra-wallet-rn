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
    RefreshControl,
    ScrollView,
    View,
    Text,
    TouchableHighlight,
    Linking,
} from "react-native";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";

import { observer } from "mobx-react-lite";


import { usePrevious } from "../../hooks";
import { useFocusEffect } from "@react-navigation/native";
import { ChainUpdaterService } from "@keplr-wallet/background";
import { ObservableQueryTxsInner } from "@keplr-wallet/stores";
import { toUiItem } from "./transaction_adapter";
import { TransactionItem } from "./transaction_history_item";

export const HistoryScreen: FunctionComponent = observer(() => {
    const [refreshing, setRefreshing] = React.useState(false);

    const { chainStore, accountStore, queriesStore, priceStore, signInteractionStore } = useStore();

    const style = useStyle();

    signInteractionStore.waitingData?.data?.signDocWrapper?.protoSignDoc

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

    // useEffect(() => {
    //     if (scrollViewRef.current) {
    //         scrollViewRef.current.scrollTo({ y: 0 });
    //     }
    // }, [chainStore.current.chainId]);

    const onRefresh = React.useCallback(async () => {
        const chainId = chainStore.current.chainId
        const account = accountStore.getAccount(chainId);
        const bech32Address = account.bech32Address;
        const queries = queriesStore.get(chainId);


        // Because the components share the states related to the queries,
        // fetching new query responses here would make query responses on all other components also refresh.

        await Promise.all([
            queries.cosmos.queryTxs
                .getQueryBech32Address(bech32Address, true)
                .waitFreshResponse(),
            queries.cosmos.queryTxs
                .getQueryBech32Address(bech32Address, false)
                .waitFreshResponse(),
        ]).catch((reason) => {
            console.log(`call failed due ${reason}`);
        }).then((value) => {
            console.log(`call done ${value}`);
        });
        setRefreshing(false);
    }, [accountStore, chainStore, priceStore, queriesStore]);

    const chainId = chainStore.current.chainId
    const account = accountStore.getAccount(chainId);
    const bech32Address = account.bech32Address;
    const queries = queriesStore.get(chainId);

    console.log(`chainId=${chainId} add=${bech32Address}`);

    const getTxs = (query: ObservableQueryTxsInner) => !query.response ? [] : query.response.data.tx_responses;

    const histories = getTxs(queries.cosmos.queryTxs.getQueryBech32Address(bech32Address, true)).concat(
        getTxs(queries.cosmos.queryTxs.getQueryBech32Address(bech32Address, false))
    ).map((txResponse) => toUiItem(bech32Address, txResponse))
        .sort((lh, rh) => rh.timestamp.localeCompare(lh.timestamp));
    console.log("hisories Size" + histories.length);
    const appCurrencies = chainStore.current.currencies;
    console.log("hisories currency " + appCurrencies.map((cur) => `${cur.coinDenom},${cur.coinMinimalDenom},${cur.coinDecimals}`).join());

    return <PageWithScrollViewInBottomTabView
        backgroundColor={style.get("color-background").color}
        contentContainerStyle={style.get("flex-grow-1")}
        style={style.flatten(["padding-x-page"])}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ref={scrollViewRef}
    >
        {histories.length == 0 && (
            <Text style={style.flatten(["color-text-black-low", "text-left", "padding-3", "body3", "flex-1"])} >
                Không tìm thấy giao dịch nào trong quá khứ.\n
                Bạn hãy kéo refresh để tải lại dữ liệu hoặc thử lại sau một lúc.
            </Text>
        )}
        {histories.length > 0 && (
            histories.map((item, index) => {
                return <TouchableHighlight key={"transaction" + index}
                    onPress={() => {
                        let txExplorer = chainStore.getChain(chainId).raw.txExplorer;
                        let txHash = item.raw?.txhash;
                        if (txExplorer && txHash) {
                            Linking.openURL(txExplorer.txUrl.replace("{txHash}", txHash.toUpperCase()));
                        }
                    }}
                >
                    <TransactionItem item={item} chainStore={chainStore} />
                </TouchableHighlight>
            })
        )}
    </PageWithScrollViewInBottomTabView>;
});

