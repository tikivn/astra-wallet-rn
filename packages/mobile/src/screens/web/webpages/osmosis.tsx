import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const OsmosisWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Astra Web App"
      source={{ uri: "http://192.168.50.49:3000" }}
      originWhitelist={["http://192.168.50.49:3000"]}
      experimentalOptions={{
        enableSuggestChain: true,
      }}
    />
  );
};

export const OsmosisFrontierWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Astra App 2"
      source={{ uri: "https://frontier.osmosis.zone" }}
      originWhitelist={["https://frontier.osmosis.zone"]}
      experimentalOptions={{
        enableSuggestChain: true,
      }}
    />
  );
};
