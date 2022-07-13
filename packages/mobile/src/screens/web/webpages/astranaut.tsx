import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const AstranautWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Astra Example"
      source={{ uri: "http://192.168.50.49:8800" }}
      originWhitelist={["http://192.168.50.49:8800"]}
    />
  );
};
