import { useCallback, useMemo } from "react";
import { ADDRESSES } from "../contracts/addresses";
import { useStore } from "../stores";
import { GAS_PRICE_GWEI } from "../utils/for-swap";
import { useWeb3 } from "./use-web3";

export const useSignTransaction = () => {
  const { web3Instance, chainId } = useWeb3();
  const { keyRingStore } = useStore();
  const gasPrice = GAS_PRICE_GWEI.testnet;

  const accountSignAsync = useMemo(async () => {
    if (!web3Instance) return;
    const privateKey = await keyRingStore.exportPrivateKey();
    return web3Instance.eth.accounts.privateKeyToAccount("0x" + privateKey);
  }, [keyRingStore, web3Instance]);

  const signTransaction = useCallback(
    async (functionAbi: any, opts: any = {}) => {
      const accountSign = await accountSignAsync;
      if (!web3Instance || !accountSign)
        return Promise.reject("An error occurred!");

      return new Promise<string>((resolve, reject) => {
        web3Instance.eth
          .getTransactionCount(accountSign.address)
          .then((_nonce) => {
            const txParams = {
              gasPrice,
              to: ADDRESSES.ROUTER[chainId],
              data: functionAbi,
              from: accountSign.address,
              nonce: web3Instance.utils.toHex(_nonce),
              ...opts,
            };
            accountSign
              .signTransaction(txParams as any)
              .then((signed) => {
                web3Instance.eth
                  .sendSignedTransaction(signed.rawTransaction || "")
                  .on("transactionHash", (hash) => {
                    resolve(hash);
                  })
                  .on("error", reject);
              })
              .catch(reject);
          });
      });
    },
    [accountSignAsync, chainId, gasPrice, web3Instance]
  );

  return signTransaction;
};
