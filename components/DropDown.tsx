import {Alert, Animated, Easing, FlatList, ScrollView, useWindowDimensions, View} from "react-native";
import {DefaultProps} from "../globalStyles";
import ThemeText, {ColorTypes, FontSizeTypes} from "./ThemeText";
import ThemeInput from "./ThemeInput";
// @ts-ignore
import More from "../imgs/more.svg";
import {useContext, useEffect, useRef, useState} from "react";
import {AppContext} from "../colors";
import NonSelectPressable from "./NonSelectPressable";
//@ts-ignore
import {AnimatedInterpolation} from "react-native/Libraries/Animated/Animated";
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";

export type DropDownElement = {
    key: string,
    value: any,
    animationHover?: Animated.Value
    interpolate?: AnimatedInterpolation
}

export interface DropDown extends DefaultProps {
    elements: DropDownElement[],
    defaultValue?: any,
    placeholder?: string,
    isEdit?: boolean,
    onSelect:(item:DropDownElement) => void
}

export default function DropDown({elements, defaultValue, placeholder, isEdit, onSelect, children, style}: DropDown) {
    const {height, width} = useWindowDimensions();
    const [current, setCurrent] = useState(defaultValue);
    const isOpen = useRef(false);
    const {colorScheme, defaultStyle, unsubscribeTouchEnd, subscribeTouchEnd} = useContext(AppContext);

    const parentNode = useRef();
    const animationHeight = useRef(new Animated.Value(0));
    const animationImageRotate = useRef(new Animated.Value(0));
    const rotateRange = animationImageRotate.current.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    useEffect(() => {
        console.log("Xq");
        subscribeTouchEnd(checkTouchEnd);

        return () => {
            console.log("XI");
            unsubscribeTouchEnd(checkTouchEnd);
        }
    }, []);

    const checkTouchEnd = (event:GestureResponderEvent):void => {
        let nodeClick = event.target;
        for (let i = 0; i < 100; i++){
            if(nodeClick === parentNode.current)
                return;

            markerCloseDropDown:{
                //@ts-ignore
                if(nodeClick.parentNode){
                    //@ts-ignore
                    nodeClick = nodeClick.parentNode;
                    if(nodeClick)
                        break markerCloseDropDown;
                }

                if(isOpen.current)
                    clickOpen();

                return;
            }
            console.log(i);
        }
    }

    function clickOpen() {
        if(elements.length === 0 && !isOpen.current){
            Alert.alert("Тайтл", "Сообщеие");
            return;
        }
        Animated.timing(animationHeight.current, {
            toValue: (isOpen.current ? 0 : 300),
            duration: 200,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease)
        }).start();
        Animated.timing(animationImageRotate.current, {
            toValue: (isOpen.current ? 0 : 1),
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
        }).start();
        isOpen.current = (!isOpen.current);
    }

    function hoverOnItem(item: DropDownElement, to: number): void {
        Animated.timing(item.animationHover, {
            toValue: to,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }

    for (let i = 0; i < elements.length; i++) {
        if (!elements[i].animationHover) {
            elements[i].animationHover = new Animated.Value(0);
        }

        if (!elements[i].interpolate || elements[i].interpolate._config.outputRange[0] != colorScheme.backgroundColor) {
            elements[i].interpolate = elements[i].animationHover.interpolate({
                inputRange: [0, 1],
                outputRange: [colorScheme.backgroundColor, colorScheme.hoverColor]
            })
        }
    }

    return (
        <View ref={parentNode} style={[{
            borderBottomWidth: 1,
            borderColor: colorScheme.borderColor,
            width: 200,
            justifyContent: "center",
            zIndex: 3,
            elevation: 3
        }, style]}>
            <NonSelectPressable style={{flexDirection: "row", paddingLeft: 15, paddingRight: 15}} onPress={clickOpen}>

                {isEdit ?
                    <ThemeInput fontSizeType={FontSizeTypes.small} style={{borderBottomWidth: null, width: "100%"}}
                                value={current}
                                onInput={setCurrent}
                                placeholder={placeholder}/>
                    :
                    <ThemeText fontSizeType={FontSizeTypes.small}
                               colorType={current ? ColorTypes.first : ColorTypes.hint}
                               style={{borderBottomWidth: null, width: "100%"}}>{current ? current : placeholder}</ThemeText>
                }
                <View>
                    <Animated.View style={{flex: 1, transform: [{rotate: rotateRange}]}}>
                        <More style={{flex: 1}} fill={colorScheme.textColor} height={24} width={24}/>
                    </Animated.View>
                </View>
            </NonSelectPressable>
            <View>
                <Animated.View style={{
                    overflow: "hidden",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    maxHeight: animationHeight.current,
                    backgroundColor: colorScheme.backgroundColor
                }}>
                    <View style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: colorScheme.borderColor,
                        height: "100%",
                        padding: 5,
                    }}>
                        <ScrollView>
                            <FlatList data={elements} renderItem={({item}) => (
                                <NonSelectPressable onPress={() => {onSelect(item.value); setCurrent(item.value); clickOpen()}} onHoverIn={(e) => hoverOnItem(item, 1)}
                                                    onHoverOut={(e) => hoverOnItem(item, 0)}>
                                    <Animated.View style={{
                                        paddingTop: 5,
                                        paddingBottom: 5,
                                        paddingLeft: 15,
                                        paddingRight: 15,
                                        backgroundColor: item.interpolate,
                                    }}>
                                        <ThemeText fontSizeType={FontSizeTypes.small}>{item.value}</ThemeText>
                                    </Animated.View>
                                </NonSelectPressable>
                            )}/>
                        </ScrollView>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}