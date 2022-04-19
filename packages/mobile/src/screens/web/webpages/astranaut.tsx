import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const AstranautWebpageScreen: FunctionComponent = () => {
  return (
    <WebpageScreen
      name="Astranaut"
      source={{ uri: "http://127.0.0.1:8800" }}
      originWhitelist={["http://127.0.0.1:8800"]}
    />
  );
};
