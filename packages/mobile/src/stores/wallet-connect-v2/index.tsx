// import SignClient from "@walletconnect/sign-client";
// import { SignClientTypes } from "@walletconnect/types";
// import { useCallback, useEffect } from "react";

// // export let signClient : SignClient
// export class SignClientStore {
//   constructor() {
//     this.init();
//   }

//   async init() {
  
//     console.log("SignClientStore init done");
//   }
  
//   async onWalletConnect(uri: string) {
//     console.log("ahihi");
//     // const signClient = await SignClient.init({
//     //   projectId: "b9223ca4e8eb35ddb23003a0a4e73b83",
//     //   relayUrl: "wss://relay.walletconnect.com",
//     //   metadata: {
//     //     name: "Astra Hub",
//     //     description: "Everything for Astra",
//     //     url: "https://astranaut.io",
//     //     icons: ["https://avatars.githubusercontent.com/u/37784886"],
//     //   },
//     // });
//     // // this.useWalletConnectEventManager()
//     // await signClient.pair({ uri });
//   }

//   // protected useWalletConnectEventManager() {
//   //   /******************************************************************************
//   //    * 1. Open session proposal modal for confirmation / rejection
//   //    *****************************************************************************/
//   //   const onSessionProposal = useCallback(
//   //     (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
//   //       console.log("SessionProposalModal", proposal);
//   //       // ModalStore.open('SessionProposalModal', { proposal })
//   //     },
//   //     []
//   //   );

//   //   /******************************************************************************
//   //    * 3. Open request handling modal based on method that was used
//   //    *****************************************************************************/
//   //   const onSessionRequest = useCallback(
//   //     async (
//   //       requestEvent: SignClientTypes.EventArguments["session_request"]
//   //     ) => {
//   //       console.log("session_request", requestEvent);
//   //       const { topic, params } = requestEvent;
//   //       const { request } = params;
//   //       const requestSession = signClient.session.get(topic);

//   //       switch (request.method) {
//   //         default:
//   //           return console.log("session_request with method: ", request.method);
//   //       }
//   //     },
//   //     []
//   //   );

//   //   /******************************************************************************
//   //    * Set up WalletConnect event listeners
//   //    *****************************************************************************/
//   //   useEffect(() => {
//   //     signClient.on("session_proposal", onSessionProposal);
//   //     signClient.on("session_request", onSessionRequest);
//   //     // TODOs
//   //     signClient.on("session_ping", (data) => console.log("ping", data));
//   //     signClient.on("session_event", (data) => console.log("event", data));
//   //     signClient.on("session_update", (data) =>
//   //       console.log("update", data)
//   //     );
//   //     signClient.on("session_delete", (data) =>
//   //       console.log("delete", data)
//   //     );
//   //   }, [onSessionProposal, onSessionRequest]);
//   // }
// }
