import React, { FunctionComponent } from "react";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

export const LinkIcon: FunctionComponent<{
  color?: string;
  height?: number;
}> = ({ color = "#F2F3F7", height = 25 }) => {
  return (
    <Svg width={height} height={height} viewBox="0 0 25 24" fill="none">
      <G clipPath="url(#clip0_5535_56515)">
        <Path
          d="M19.25 9.318V11.085C19.7067 11.4967 20 12.0877 20 12.75V15.75C20 16.9905 18.9905 18 17.75 18H11C9.7595 18 8.75 16.9905 8.75 15.75V12.75C8.75 11.5095 9.7595 10.5 11 10.5H14.75V9H11C8.93225 9 7.25 10.6823 7.25 12.75V15.75C7.25 17.8177 8.93225 19.5 11 19.5H17.75C19.8177 19.5 21.5 17.8177 21.5 15.75V12.75C21.5 11.2162 20.5723 9.8985 19.25 9.318Z"
          fill={color}
        />
        <Path
          d="M14 4.5H7.25C5.18225 4.5 3.5 6.18225 3.5 8.25V11.25C3.5 12.7838 4.42775 14.1015 5.75 14.682V12.915C5.29325 12.5025 5 11.9123 5 11.25V8.25C5 7.0095 6.0095 6 7.25 6H14C15.2405 6 16.25 7.0095 16.25 8.25V11.25C16.25 12.4905 15.2405 13.5 14 13.5H10.25V15H14C16.0677 15 17.75 13.3177 17.75 11.25V8.25C17.75 6.18225 16.0677 4.5 14 4.5Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_5535_56515">
          <Rect
            width="18"
            height="18"
            fill="white"
            transform="translate(3.5 3)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
