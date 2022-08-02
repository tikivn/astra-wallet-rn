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
