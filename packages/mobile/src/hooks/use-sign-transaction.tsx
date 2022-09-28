import { hexlify } from "@ethersproject/bytes";
import { TransactionRequest } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";
import { EthSignType } from "@keplr-wallet/types";
import { useCallback, useMemo } from "react";
import { useStore } from "../stores";
import { GAS_PRICE, GAS_PRICE_GWEI } from "../utils/for-swap";
import addresses from "../utils/for-swap/addresses";
import { useWeb3 } from "./use-web3";

export const useSignTransaction = () => {
  const { etherProvider, chainId, account, accountHex, chainIdStr } = useWeb3();
  const { keyRingStore, accountStore, transactionStore } = useStore();
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
    ): Promise<string> => {
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

  const signEthereum = useCallback(
    async (
      encodeFunctionData: string,
      { gas, value, ...opts }: { [key: string]: string }
    ): Promise<string> => {
      const keplr = await accountStore
        .getAccount(account.bech32Address)
        .getKeplr();

      return new Promise((resolve, reject) => {
        etherProvider
          .getTransactionCount(accountHex)
          .then((_nonce) => {
            const txParams = {
              gasPrice,
              to: addresses.ROUTER[chainId],
              data: encodeFunctionData,
              from: accountHex,
              chainId: chainId,
              nonce: hexlify(_nonce),
              gas,
              value,
              ...opts,
            };
            if (!keplr) {
              throw new Error("Error with Keplr provider");
            }
            return keplr?.signEthereum(
              chainIdStr,
              account.bech32Address,
              JSON.stringify(txParams),
              EthSignType.TRANSACTION
            );
          })
          .then((sign) => {
            if (!sign) {
              throw new Error("Sign with error");
            }
            const hex = Buffer.from(sign).toString("hex");
            return etherProvider.sendTransaction("0x" + hex);
          })
          .then(({ hash }) => {
            return etherProvider.waitForTransaction(hash);
          })
          .then(({ transactionHash, gasUsed }) => {
            transactionStore.updateTxState("success");
            const rawData = transactionStore.rawData;
            if (rawData) {
              const gasUsedStr = formatUnits(
                gasUsed.mul(GAS_PRICE.testnet),
                "gwei"
              );
              transactionStore.updateRawData({
                ...rawData,
                value: {
                  ...rawData.value,
                  transactionHash,
                  gasUsed: gasUsedStr,
                },
              });
            }
            resolve(transactionHash);
          })
          .catch((err) => {
            transactionStore.updateTxState("failure");

            console.error("Error Sign Data ", { error: err });
            reject(err);
          });
      });
    },
    [
      account.bech32Address,
      accountHex,
      accountStore,
      chainId,
      chainIdStr,
      etherProvider,
      gasPrice,
      transactionStore,
    ]
  );

  return { signTransaction, signEthereum };
};
