import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const AstranautWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Astra Web App"
      source={{ uri: "https://app.astranaut.dev" }}
      originWhitelist={["https://app.astranaut.dev"]}
    />
  );
};

export const AstraDefiWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Astra Defi"
      source={{ uri: "http://192.168.50.49:3000" }}
      originWhitelist={["http://192.168.50.49:3000"]}
    />
  );
};
