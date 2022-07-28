import { Web3Provider } from "@ethersproject/providers";
import converter from "bech32-converting";
import { useEffect, useMemo, useRef, useState } from "react";
import Web3 from "web3";

import { useStore } from "../stores";

export const useWeb3 = () => {
  const web3Ref = useRef<Web3>();
  const etherProviderRef = useRef<Web3Provider>();
  const { chainStore, accountStore } = useStore();
  const { rpc, bech32Config } = chainStore.current;
  const [chainId, setChainId] = useState<number>();

  const account = useMemo(() => {
    return accountStore.getAccount(chainStore.current.chainId);
  }, [accountStore, chainStore]);
  const accountHex = useMemo(() => {
    const prefix = bech32Config.bech32PrefixAccAddr;
    const address = converter(prefix).toHex(account.bech32Address);
    return address;
  }, [account.bech32Address, bech32Config.bech32PrefixAccAddr]);

  useEffect(() => {
    if (rpc) {
      const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
      web3Ref.current = web3;

      etherProviderRef.current = new Web3Provider(
        new Web3.providers.HttpProvider(rpc) as any
      );
      (async () => {
        if (etherProviderRef.current) {
          const chain = (await etherProviderRef.current.getNetwork()).chainId;
          setChainId(chain);
        }
        // const a = await web3.eth.getAccounts();
        // console.log("🚀 -> a", a);
      })();
    }
  }, [rpc]);

  return {
    web3Instance: web3Ref.current,
    etherProvider: etherProviderRef.current,
    chainId,
    account,
    accountHex,
  };
};
