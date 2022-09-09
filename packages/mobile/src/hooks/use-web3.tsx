import { Web3Provider } from "@ethersproject/providers";
import { ChainId, Token } from "@solarswap/sdk";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { AppChainInfo } from "../config";

import { default as Web3ProviderHttp } from "web3-providers-http";
import { useStore } from "../stores";
import { RPC_ENPOINT } from "../utils/for-swap";
import addresses from "../utils/for-swap/addresses";

export const useWeb3 = () => {
  const { chainStore, accountStore } = useStore();
  const { chainId: chainIdStr, chainIdNumber: chainId } = useMemo(
    () => chainStore.current as AppChainInfo,
    [chainStore]
  );

  const etherProviderRef = useRef<Web3Provider>(
    new Web3Provider(
      new (Web3ProviderHttp as any)(RPC_ENPOINT[chainId as ChainId]) as any
    )
  );

  const account = useMemo(() => {
    return accountStore.getAccount(chainIdStr);
  }, [accountStore, chainIdStr]);

  const accountHex = useMemo(() => account.hexAddress, [account.hexAddress]);

  const wasaImg = useMemo(() => chainStore.current.stakeCurrency.coinImageUrl, [
    chainStore,
  ]);

  const WASA = useMemo(
    () =>
      new Token(
        chainId || ChainId.TESTNET,
        addresses.WASA[chainId || ChainId.TESTNET],
        18,
        "ASA",
        "Wrap ASA",
        wasaImg
      ),
    [chainId, wasaImg]
  );

  const getStore = useCallback(() => {
    return { chainStore, accountStore };
  }, [accountStore, chainStore]);

  useEffect(() => {
    (async () => {
      console.log(
        "sssss test 1232: => ",
        await etherProviderRef.current.getNetwork()
      );
    })();
  }, []);

  return {
    etherProvider: etherProviderRef.current,
    chainId: chainId || ChainId.TESTNET,
    account,
    accountHex,
    chainIdStr,
    WASA,
    getStore,
  };
};
