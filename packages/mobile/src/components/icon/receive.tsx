import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const ReceiveIcon: FunctionComponent<{
    color: string;
    size: number;
}> = ({ color, size = 20 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 21 20" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10.5 3.125C10.8452 3.125 11.125 3.40482 11.125 3.75V14.7411L14.4331 11.4331C14.6771 11.189 15.0729 11.189 15.3169 11.4331C15.561 11.6771 15.561 12.0729 15.3169 12.3169L10.9419 16.6919C10.6979 16.936 10.3021 16.936 10.0581 16.6919L5.68306 12.3169C5.43898 12.0729 5.43898 11.6771 5.68306 11.4331C5.92714 11.189 6.32286 11.189 6.56694 11.4331L9.875 14.7411V3.75C9.875 3.40482 10.1548 3.125 10.5 3.125Z" fill={color} />
        </Svg>
    );
};