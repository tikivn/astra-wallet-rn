import { ChainId, Token } from "@solarswap/sdk";
import { Web3Provider } from "@ethersproject/providers";
import converter from "bech32-converting";
import { useCallback, useMemo, useRef } from "react";
import Web3 from "web3";
import { AppChainInfo } from "../config";
import { ADDRESSES } from "../contracts/addresses";

import { useStore } from "../stores";
import { RPC_ENPOINT } from "../utils/for-swap";

export const useWeb3 = () => {
  const { chainStore, accountStore } = useStore();
  const {
    bech32Config,
    chainId: chainIdStr,
    chainIdNumber: chainId,
  } = useMemo(() => chainStore.current as AppChainInfo, [chainStore]);

  const web3Ref = useRef<Web3>(
    new Web3(new Web3.providers.HttpProvider(RPC_ENPOINT[chainId as number]))
  );

  const etherProviderRef = useRef<Web3Provider>(
    new Web3Provider(web3Ref.current.currentProvider as any)
  );

  const account = useMemo(() => {
    return accountStore.getAccount(chainIdStr);
  }, [accountStore, chainIdStr]);

  const accountHex = useMemo(() => {
    const prefix = bech32Config.bech32PrefixAccAddr;
    const address = converter(prefix).toHex(account.bech32Address);
    return address;
  }, [account.bech32Address, bech32Config.bech32PrefixAccAddr]);

  const wasaImg = useMemo(() => chainStore.current.stakeCurrency.coinImageUrl, [
    chainStore,
  ]);

  const WASA = useMemo(
    () =>
      new Token(
        chainId || ChainId.TESTNET,
        ADDRESSES.WASA[chainId || ChainId.TESTNET],
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

  return {
    web3Instance: web3Ref.current,
    etherProvider: etherProviderRef.current,
    chainId,
    account,
    accountHex,
    chainIdStr,
    WASA,
    getStore,
  };
};
