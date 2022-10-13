import { RouteProp, useRoute } from "@react-navigation/native";
import React, { FunctionComponent } from "react";
import { WebpageScreen } from "../components/webpage-screen";

export const DappsWebpageScreen: FunctionComponent = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          name: string;
          uri: string;
        }
      >,
      string
    >
  >();

  const name = route.params.name;
  const uri = route.params.uri;

  return (
    <WebpageScreen
      name={name}
      source={{ uri: uri }}
      originWhitelist={[uri]}
    />
  );
};
