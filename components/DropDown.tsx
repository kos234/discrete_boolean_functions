import {
    Alert,
    Animated,
    Easing,
    FlatList,
    InteractionManager, Platform,
    ScrollView,
    useWindowDimensions,
    View
} from "react-native";
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
    const ignoreClick = useRef(false);
    const {colorScheme, defaultStyle, unsubscribeTouchEnd, subscribeTouchEnd} = useContext(AppContext);

    const refAnimations = useRef<{ animationHover: Animated.Value, interpolate: AnimatedInterpolation }[]>([])
    const parentNode = useRef();
    const animationDropDown = useRef(new Animated.Value(0));
    const animationImageRotate = useRef(new Animated.Value(0));
    const refCloseAfterClickAnywhere = useRef<ReturnType<typeof setTimeout | null>>(null);
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

    const checkTouchEnd = (): void => {
        clearInterval(refCloseAfterClickAnywhere.current);
        console.log("isopen", isOpen.current)
        if(ignoreClick.current){
            ignoreClick.current = false;
            return
        }
        if (isOpen.current)
            refCloseAfterClickAnywhere.current = setTimeout(() => {
                console.log("WTF")
                clickOpen();
            }, 100);
    }

    function clickOpen() {
        if (elements.length === 0 && !isOpen.current) {
            return;
        }
        Animated.timing(animationDropDown.current, {
            toValue: (isOpen.current ? 0 : 1),
            duration: 200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
        }).start();
        Animated.timing(animationImageRotate.current, {
            toValue: (isOpen.current ? 0 : 1),
            duration: 200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
        }).start();
        isOpen.current = (!isOpen.current);
        console.log("isOpen.current", isOpen.current);
    }

    function hoverOnItem(itemIndex: number, to: number): void {
        Animated.timing(refAnimations.current[itemIndex].animationHover, {
            toValue: to,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }

    const deltaAnimations = elements.length - refAnimations.current.length;
    if (deltaAnimations < 0) {
        refAnimations.current.splice(elements.length + deltaAnimations, -1 * deltaAnimations);
    }

    for (let i = 0; i < elements.length; i++) {
        if (refAnimations.current.length <= i) {
            refAnimations.current.push({animationHover: new Animated.Value(0), interpolate: null});
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
        }, style]}>
            <NonSelectPressable style={{flexDirection: "row", paddingLeft: 5, paddingRight: 5}} onPress={(item) => {
                if(Platform.OS === "web")
                    ignoreClick.current = true;
                clearInterval(refCloseAfterClickAnywhere.current);
                clickOpen();
            }}>
                {isEdit ?
                    <ThemeInput fontSizeType={FontSizeTypes.normal} style={{borderBottomWidth: null, width: "100%"}}
                                value={defaultValue}
                                onInput={onSelect}
                                placeholder={placeholder}/>
                    :
                    <ThemeText fontSizeType={FontSizeTypes.normal}
                               colorType={defaultValue ? ColorTypes.first : ColorTypes.hint}
                               style={{
                                   borderBottomWidth: null,
                                   width: "100%"
                               }}>{defaultValue ? defaultValue : placeholder}</ThemeText>
                }
                <View>
                    <Animated.View style={{flex: 1, justifyContent: "center", transform: [{rotate: rotateRange}]}}>
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
                    transform: [{scaleY: animationDropDown.current}],
                    transformOrigin: "top center",
                    backgroundColor: colorScheme.backgroundColor,
                    zIndex: 4,
                    elevation: 4,
                }}>
                    <View style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: colorScheme.borderColor,
                        padding: 5,
                    }}>
                        <ScrollView>
                            {elements.map((value: DropDownElement, index: number) => (
                                <NonSelectPressable key={"key" + index} onPress={() => {
                                    onSelect(value);
                                    // clickOpen()
                                }} onHoverIn={(e) => hoverOnItem(index, 1)}
                                                    onHoverOut={(e) => hoverOnItem(index, 0)}>
                                    <Animated.View style={{
                                        paddingTop: 5,
                                        paddingBottom: 5,
                                        paddingLeft: 15,
                                        paddingRight: 15,
                                        backgroundColor: refAnimations.current[index].interpolate,
                                    }}>
                                        <ThemeText fontSizeType={FontSizeTypes.normal}>{value.value}</ThemeText>
                                    </Animated.View>
                                </NonSelectPressable>
                            ))}
                        </ScrollView>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}