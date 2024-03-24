import {Platform, Pressable, Text, TextProps} from "react-native";
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";
import {PressableProps} from "react-native/Libraries/Components/Pressable/Pressable";
import {useContext, useEffect, useRef} from "react";
import {AppContext} from "../colors";
import {Link} from "@react-navigation/native";
import * as React from "react";
import {DefaultProps} from "../globalStyles";

interface CustomLinkProps extends DefaultProps{
    to:string,
}
export default function CustomLink({children, style, to}: CustomLinkProps) {
    const {sendTouchEndEvent} = useContext(AppContext)
    function innerPress(event:GestureResponderEvent):void{
        sendTouchEndEvent(event);
    }

    return (
        <Link to={to} style={style} onPress={sendTouchEndEvent}>
            {children}
        </Link>
    );
}