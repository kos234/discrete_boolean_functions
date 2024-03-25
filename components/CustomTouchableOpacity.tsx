import {TouchableOpacityProps} from "react-native/Libraries/Components/Touchable/TouchableOpacity";
import {reportUnexpectedLogBoxError} from "@expo/metro-runtime/build/error-overlay/Data/LogBoxData";
import {useContext, useRef} from "react";
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";
import {Pressable, TouchableOpacity} from "react-native";
import {AppContext} from "../colors";

export default function CustomTouchableOpacity(props:TouchableOpacityProps){
    const originalOnPress = useRef(props.onPress);
    const {sendTouchEndEvent} = useContext(AppContext)

    function innerPress(event:GestureResponderEvent):void{
        sendTouchEndEvent(event);
        if(props.onPress)
            props.onPress(event);
    }

    return (
        <TouchableOpacity {...props} onPress={innerPress}/>
    );
}