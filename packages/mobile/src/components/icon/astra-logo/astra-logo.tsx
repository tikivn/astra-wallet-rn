import React, { FunctionComponent } from "react";
import Svg, { G, Mask, Path } from "react-native-svg";

export const AstraLogo: FunctionComponent = () => {
  return (
    <Svg width="38" height="41" viewBox="0 0 38 41" fill="none">
      <G clipPath="url(#clip0_5039_68454)">
        <Mask id="mask0_5039_68454" x="6" y="2" width="26" height="33">
          <Path
            d="M21.5995 16.7211H24.4832L18.9645 2.04199L13.4459 16.7211H16.6478C17.0321 16.7211 17.3777 16.4722 17.5205 16.0925L18.9645 12.2514L20.2905 15.7782C20.5046 16.3477 21.023 16.7211 21.5995 16.7211Z"
            fill="white"
          />
          <Path
            d="M23.992 25.6238L18.9645 22.467L13.9371 25.6239L15.5952 21.2134C15.766 20.7593 15.6029 20.2404 15.2098 19.9868L12.802 18.4338L6.74609 34.542L18.9645 26.8698L31.183 34.542L25.1271 18.4338L22.7193 19.9868C22.3262 20.2404 22.1631 20.7593 22.3338 21.2134L23.992 25.6238Z"
            fill="white"
          />
        </Mask>
        <G mask="url(#mask0_5039_68454)">
          <Path
            d="M18.9645 26.8698L6.74609 34.542L13.9371 25.6238L18.9645 22.467V26.8698Z"
            fill="white"
          />
          <Path
            d="M15.2133 19.9891L12.802 18.4338L6.74609 34.542L13.9371 25.6238L15.6073 21.1814C15.7729 20.7407 15.6089 20.2442 15.2133 19.9891Z"
            fill="white"
          />
          <Path
            d="M17.5272 16.073L18.964 12.2514V2.04199L13.4453 16.7211H16.5912C17.0077 16.7211 17.3806 16.4629 17.5272 16.073Z"
            fill="white"
          />
          <G>
            <Path
              d="M22.3221 21.1813L23.9923 25.6238L18.9648 22.467V26.8698L31.1833 34.542L25.1274 18.4338L22.7161 19.9891C22.3205 20.2442 22.1564 20.7407 22.3221 21.1813Z"
              fill="white"
            />
            <Path
              d="M21.6838 16.7211H24.4835L18.9648 2.04199V12.2514L20.2798 15.749C20.4997 16.3338 21.059 16.7211 21.6838 16.7211Z"
              fill="white"
            />
          </G>
        </G>
      </G>
    </Svg>
  );
};
