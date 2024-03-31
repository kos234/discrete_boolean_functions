import {Alert, Animated, Easing, FlatList, ScrollView, useWindowDimensions, View} from "react-native";
import {DefaultProps} from "../globalStyles";
import ThemeText, {ColorTypes, FontSizeTypes} from "./ThemeText";
import ThemeInput from "./ThemeInput";
// @ts-ignore
import More from "../imgs/more.svg";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {AppContext} from "../colors";
import NonSelectPressable from "./NonSelectPressable";
//@ts-ignore
import {AnimatedInterpolation} from "react-native/Libraries/Animated/Animated";
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";

export type DropDownElement = {
    key: string,
    value: any,
}

export interface DropDownProps extends DefaultProps {
    readonly elements: DropDownElement[],
    defaultValue?: any,
    placeholder?: string,
    isEdit?: boolean,
    onSelect: (item: DropDownElement) => void
}

export default function DropDown({elements, defaultValue, placeholder, isEdit, onSelect, style}: DropDownProps) {
    const isOpen = useRef(false);
    const {colorScheme, defaultStyle, unsubscribeTouchEnd, subscribeTouchEnd} = useContext(AppContext);

    const refAnimations = useRef<{ animationHover: Animated.Value, interpolate: AnimatedInterpolation }[]>([])
    const parentNode = useRef();
    const animationHeight = useRef(new Animated.Value(0));
    const animationImageRotate = useRef(new Animated.Value(0));
    const rotateRange = animationImageRotate.current.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    useEffect(() => {
        subscribeTouchEnd(checkTouchEnd);

        return () => {
            unsubscribeTouchEnd(checkTouchEnd);
        }
    }, []);

    const checkTouchEnd = (event: GestureResponderEvent): void => {
        let nodeClick = event.target;
        for (let i = 0; i < 100; i++) {
            if (nodeClick === parentNode.current)
                return;

            markerCloseDropDown:{
                //@ts-ignore
                if (nodeClick.parentNode) {
                    //@ts-ignore
                    nodeClick = nodeClick.parentNode;
                    if (nodeClick)
                        break markerCloseDropDown;
                }

                if (isOpen.current)
                    clickOpen();

                return;
            }
        }
    }

    function clickOpen() {
        if (elements.length === 0 && !isOpen.current) {
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

    function hoverOnItem(itemIndex: number, to: number): void {
        Animated.timing(refAnimations.current[itemIndex].animationHover, {
            toValue: to,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }

    const deltaAnimations = elements.length - refAnimations.current.length;
    if(deltaAnimations < 0) {
        refAnimations.current.splice(elements.length + deltaAnimations, -1 * deltaAnimations);

    }

    for(let i = 0; i < elements.length; i++){
        if(refAnimations.current.length <= i){
            refAnimations.current.push({animationHover: new Animated.Value(0), interpolate: null});
            console.log("PUSH ANIM");
        }

        if (!refAnimations.current[i].interpolate || refAnimations.current[i].interpolate._config.outputRange[0] != colorScheme.backgroundColor) {
            refAnimations.current[i].interpolate = refAnimations.current[i].animationHover.interpolate({
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
                                value={defaultValue}
                                onInput={onSelect}
                                placeholder={placeholder}/>
                    :
                    <ThemeText fontSizeType={FontSizeTypes.small}
                               colorType={defaultValue ? ColorTypes.first : ColorTypes.hint}
                               style={{
                                   borderBottomWidth: null,
                                   width: "100%"
                               }}>{defaultValue ? defaultValue : placeholder}</ThemeText>
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
                    backgroundColor: colorScheme.backgroundColor,
                    zIndex: 4,
                    elevation: 4,
                }}>
                    <View style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: colorScheme.borderColor,
                        maxHeight: 300,
                        padding: 5,
                    }}>
                        <ScrollView>
                            <FlatList data={elements} renderItem={({item, index}) => (
                                <NonSelectPressable onPress={() => {
                                    onSelect(item);
                                    clickOpen()
                                }} onHoverIn={(e) => hoverOnItem(index, 1)}
                                                    onHoverOut={(e) => hoverOnItem(index, 0)}>
                                    <Animated.View style={{
                                        paddingTop: 5,
                                        paddingBottom: 5,
                                        paddingLeft: 15,
                                        paddingRight: 15,
                                        backgroundColor: refAnimations.current[index].interpolate,
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