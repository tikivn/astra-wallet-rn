import React, { FunctionComponent } from "react";
import Svg, { Path} from "react-native-svg";

export const SendIcon: FunctionComponent<{
    color: string;
    size: number;
}> = ({ color, size = 20 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 21 20" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10.0581 3.30806C10.3021 3.06398 10.6979 3.06398 10.9419 3.30806L15.3169 7.68306C15.561 7.92714 15.561 8.32286 15.3169 8.56694C15.0729 8.81102 14.6771 8.81102 14.4331 8.56694L11.125 5.25888V16.25C11.125 16.5952 10.8452 16.875 10.5 16.875C10.1548 16.875 9.875 16.5952 9.875 16.25V5.25888L6.56694 8.56694C6.32286 8.81102 5.92714 8.81102 5.68306 8.56694C5.43898 8.32286 5.43898 7.92714 5.68306 7.68306L10.0581 3.30806Z" fill={color} />
        </Svg>
    );
};