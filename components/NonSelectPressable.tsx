import {DefaultProps} from "../globalStyles";
import {Platform, Pressable} from "react-native";
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";
import {PressableProps} from "react-native/Libraries/Components/Pressable/Pressable";
import {useContext, useEffect, useRef} from "react";
import {AppContext} from "../colors";

export default function NonSelectPressable(props: PressableProps) {
    const {sendTouchEndEvent} = useContext(AppContext)

    if (Platform.OS === "web" && props.style)
        //@ts-ignore
        props.style.userSelect = "none"

    const originalOnPress = useRef(props.onPress);

    function innerPress(event:GestureResponderEvent):void{
        sendTouchEndEvent(event);
        if(props.onPress)
            props.onPress(event);
    }

    return (
        <Pressable {...props} onPress={innerPress}/>
    );
}