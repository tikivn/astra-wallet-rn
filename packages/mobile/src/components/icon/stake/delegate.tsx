import React, { FunctionComponent } from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

export const DelegateIcon: FunctionComponent = () => {
  return (
    <Svg width="25" height="24" viewBox="0 0 25 24" fill="none">
      <G clipPath="url(#clip0_5236_63196)">
        <Path d="M13.582 4.5C13.582 4.08579 13.2462 3.75 12.832 3.75C12.4178 3.75 12.082 4.08579 12.082 4.5V11.25H5.33203C4.91782 11.25 4.58203 11.5858 4.58203 12C4.58203 12.4142 4.91782 12.75 5.33203 12.75H12.082V19.5C12.082 19.9142 12.4178 20.25 12.832 20.25C13.2462 20.25 13.582 19.9142 13.582 19.5V12.75H20.332C20.7462 12.75 21.082 12.4142 21.082 12C21.082 11.5858 20.7462 11.25 20.332 11.25H13.582V4.5Z" fill="white" />
      </G>
      <Defs>
        <ClipPath id="clip0_5236_63196">
          <Rect width="18" height="18" fill="white" transform="translate(3.83203 3)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
