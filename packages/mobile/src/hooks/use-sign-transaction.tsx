import { hexlify } from "@ethersproject/bytes";
import { TransactionRequest } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { useCallback, useMemo } from "react";
import { useStore } from "../stores";
import { GAS_PRICE_GWEI } from "../utils/for-swap";
import addresses from "../utils/for-swap/addresses";
import { useWeb3 } from "./use-web3";

export const useSignTransaction = () => {
  const { etherProvider, chainId } = useWeb3();
  const { keyRingStore } = useStore();
  const gasPrice = GAS_PRICE_GWEI.testnet;

  const walletSignAsync = useMemo(async () => {
    if (!etherProvider) return;
    const privateKey = await keyRingStore.exportPrivateKey();
    const wallet = new Wallet(`0x${privateKey}`, etherProvider);
    return wallet;
  }, [etherProvider, keyRingStore]);

  const signTransaction = useCallback(
    async (
      encodeFunctionData: string,
      opts: Partial<TransactionRequest> = {}
    ) => {
      const accountSign = await walletSignAsync;
      if (!walletSignAsync || !accountSign)
        return Promise.reject("An error occurred!");

      return new Promise<string>((resolve, reject) => {
        etherProvider
          .getTransactionCount(accountSign.address)
          .then((_nonce) => {
            const txParams: TransactionRequest = {
              gasPrice,
              to: addresses.ROUTER[chainId],
              data: encodeFunctionData,
              from: accountSign.address,
              nonce: hexlify(_nonce),
              chainId,
              ...opts,
            };
            accountSign
              .signTransaction(txParams)
              .then((signed) => etherProvider.sendTransaction(signed))
              .then(({ hash }) => etherProvider.waitForTransaction(hash))
              .then(({ transactionHash }) => resolve(transactionHash))
              .catch((err) => {
                console.log("Error Sign Data ", { error: err, opts });
                reject(err);
              });
          })
          .catch((err) => {
            console.log("Error sign => ", { error: err });
          });
      });
    },
    [chainId, etherProvider, gasPrice, walletSignAsync]
  );

  return signTransaction;
};
