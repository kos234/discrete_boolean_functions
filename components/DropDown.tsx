import {Animated, Easing, FlatList, ScrollView, Text, useWindowDimensions, View} from "react-native";
import {DefaultProps} from "../globalStyles";
import ThemeText, {FontSizeTypes} from "./ThemeText";
import ThemeInput from "./ThemeInput";
// @ts-ignore
import More from "../imgs/more.svg";
import {useContext, useRef, useState} from "react";
import {ThemeContext} from "../colors";
import NonSelectPressable from "./NonSelectPressable";
//@ts-ignore
import {AnimatedInterpolation} from "react-native/Libraries/Animated/Animated";

type DropDownElement = {
    key:string,
    value:any,
    animationHover?:Animated.Value
    interpolate?: AnimatedInterpolation
}
interface DropDown extends DefaultProps {
    elements: DropDownElement[],
    defaultValue?: string,
    placeholder?: string,
}

export default function DropDown({elements, defaultValue, placeholder, children, style}: DropDown) {
    const {height, width} = useWindowDimensions();
    const [current, setCurrent] = useState(defaultValue);
    const isOpen = useRef(false);
    const {colorScheme, defaultStyle} = useContext(ThemeContext);

    // const styles = StyleSheet.create({
    //     dropDownElems:{
    //         ":hover":{
    //             color: "blue"
    //         }
    //     }
    // });

    const animationHeight = useRef(new Animated.Value(0));
    const animationImageRotate = useRef(new Animated.Value(0));
    const rotateRange = animationImageRotate.current.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    })
    function clickOpen(){
        Animated.timing(animationHeight.current, {
            toValue: (isOpen.current ? 0 : 300),
            duration: 200,
            useNativeDriver: true,
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

    function hoverOnItem(item:DropDownElement, to:number):void{
        Animated.timing(item.animationHover, {
            toValue: to,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }

    for(let i = 0; i < elements.length; i++){
        if(!elements[i].animationHover) {
            elements[i].animationHover = new Animated.Value(0);
            console.log("elements[i].animationHover", elements[i]);
            elements[i].interpolate = elements[i].animationHover.interpolate({
                inputRange: [0, 1],
                outputRange: ["#eff2f1", "#1d1d1d"]
            })
        }
    }

    return (
        <View style={{
            borderBottomWidth: 1,
            borderColor: colorScheme.borderColor,
            // borderWidth: 1,
            // borderRadius: 10,
            width: 200,
            justifyContent:"center"
            // overflow: "hidden"
        }}>
            <View style={{flexDirection: "row", paddingLeft: 15, paddingRight: 15}}>
                <ThemeInput fontSizeType={FontSizeTypes.small} style={{borderBottomWidth: null, width: "100%"}} value={current}
                            onInput={setCurrent}
                            placeholder={placeholder}/>
                <NonSelectPressable style={{}} onPress={clickOpen}>
                    <Animated.View style={{flex: 1, transform: [{rotate: rotateRange}]}}>
                        <More style={{flex: 1}} fill={colorScheme.textColor} height={24} width={24}/>
                    </Animated.View>
                </NonSelectPressable>
            </View>
            <View style={{}}>
                <Animated.View style={{overflow: "hidden", position: "absolute", top:0, left: 0, backgroundColor: colorScheme.backgroundColor, width: "100%", height: animationHeight.current}}>
                    <View style={{borderWidth: 1, borderRadius: 10, height: "100%", padding: 5}}>
                        <ScrollView style={{backgroundColor: "red"}}>
                            <FlatList style={{}} data={elements} renderItem={({item}) => (
                                <NonSelectPressable onHoverIn={(e) => hoverOnItem(item, 1)} onHoverOut={(e) => hoverOnItem(item, 0)}>
                                    <Animated.View style={{paddingTop: 5, paddingBottom: 5, paddingLeft: 15, paddingRight: 15, backgroundColor: item.interpolate}}>
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