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
    const wallet = new Wallet(privateKey, etherProvider);
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
              ...opts,
            };
            accountSign
              .signTransaction(txParams)
              .then((signed) => {
                console.log("🚀 -> .then -> signed", signed);
                // accountSign
                //   .sendTransaction(signed)
                //   .on("transactionHash", (hash) => {
                //     resolve(hash);
                //   })
                //   .on("error", reject);
                // etherProvider.sendTransaction()
              })
              .catch(reject);
          });
      });
    },
    [chainId, etherProvider, gasPrice, walletSignAsync]
  );

  return signTransaction;
};
