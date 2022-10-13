import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const CopyIconNew: FunctionComponent<{
    color: string;
    size: number;
  }> = ({ color, size = 16 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 17 18" fill="none">
        <Path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M1 0.75C0.585786 0.75 0.25 1.08579 0.25 1.5V12C0.25 12.4142 0.585786 12.75 1 12.75H4.75V16.5C4.75 16.9142 5.08579 17.25 5.5 17.25H16C16.4142 17.25 16.75 16.9142 16.75 16.5V6C16.75 5.58579 16.4142 5.25 16 5.25H12.25V1.5C12.25 1.08579 11.9142 0.75 11.5 0.75H1ZM10.75 2.25H1.75V11.25H10.75V2.25ZM6.25 12.75H11.5C11.9142 12.75 12.25 12.4142 12.25 12V6.75H15.25V15.75H6.25V12.75Z" 
            fill={color}/>
        </Svg>
    );
  };