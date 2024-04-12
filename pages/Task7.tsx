import Limiter from "../components/Limiter";
import {ScrollView, TouchableOpacity, useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, safeToString} from "../utils/utils";
import React, {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {drawTableBoolFunction, getRandomVector, getValueINDNF, KNF, parseDNF} from "../utils/boolsUtils";
import {DropDownElement} from "../components/DropDown";
import useJSONState from "../utils/useJSONState";
import useErrorState from "../utils/useErrorState";

const Task5ElemStatuses: DropDownElement[] = [{key: "false", value: "фиктивная"}, {key: "true", value: "существенная"}]
export default function Task7() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nValue, setNValue] = useState<number>();
    const [vector, setVector] = useState<string>(null);
    const [vectorError, isVectorError, setVectorError] = useErrorState(null, 0);
    const [knfError, isKDNFError, setKNFError] = useErrorState(null);
    const [message, setMessage] = useState<{ colorType: ColorTypes, value: string }>(null);
    const [rawDNF, setRawDNF] = useState("");
    const knfRef = useRef<KNF>(null);

    function generateVector(value: string) {
        const n = parseInt(value);
        const res = getRandomVector(n);
        setVectorError(res.error);
        setVector(res.value);
        setNValue(n);
    }

    function onInputDNF(value: string) {
        setRawDNF(value);

        const res = parseDNF(value, false);
        setKNFError(res.error);

        if (res.error)
            return;

        if (nValue < res.value.getMaxPow()) {
            setKNFError(`Количество переменных в ДНФ больше чем в векторе - ${res.value.getMaxPow()}`);
            return;
        }

        knfRef.current = res.value;
    }

    function onClick() {
        if(message){
            onInputDNF("");
            setVector(getRandomVector(nValue).value);
            setMessage(null);
            return;
        }

        if(rawDNF.length === 0){
            setKNFError("Введите КНФ!");
        }

        if(isVectorError.current || isKDNFError.current)
            return;

        for (let i = 0; i < 1 << nValue; i++) {
            if (getValueINDNF(i, nValue, knfRef.current) + "" !== vector[i]) {
                setMessage({value: "Неправильный КНФ!", colorType: ColorTypes.error});
                return;
            }
        }

        setMessage({value: "Правильно!", colorType: ColorTypes.success});
    }

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите n:  </ThemeText>
                <ThemeInput style={{
                    flex: adaptiveLess(width, 0, {"478": 1}),
                    width: adaptiveLess(width, null, {"478": 2})
                }} value={safeToString(nValue)} onInput={generateVector} typeInput={"numeric"} placeholder={"число"}
                            fontSizeType={FontSizeTypes.normal}/>
            </View>
            {vectorError ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{vectorError}</ThemeText>
            </View> : null}

            {vector && nValue ? <>
                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>f = </ThemeText>
                    <ScrollView horizontal={true}>
                        <ThemeText>({vector})</ThemeText>
                    </ScrollView>
                </View>

                <View style={[{flexDirection: "row", flexWrap: "wrap"}, defaultStyle.marginTopNormal]}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>Введите КНФ:  </ThemeText>
                    <ThemeInput
                        style={{
                            width: adaptiveLess(width, null, {"478": "100%"})
                        }}
                        value={rawDNF} onInput={onInputDNF}
                        placeholder={"КНФ"}
                        fontSizeType={FontSizeTypes.normal}/>
                </View>

                {knfError ? <View style={defaultStyle.marginTopSmall}>
                    <ThemeText colorType={ColorTypes.error}
                               fontSizeType={FontSizeTypes.error}>{knfError}</ThemeText>
                </View> : null}

                {message ? <>
                    {drawTableBoolFunction(vector, defaultStyle, colorScheme, undefined, knfRef.current)}
                    <View style={defaultStyle.marginTopSmall}>
                        <ThemeText colorType={message.colorType}
                                   fontSizeType={FontSizeTypes.error}>{message.value}</ThemeText>
                    </View>
                </> : null}

                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                    <TouchableOpacity onPress={onClick} style={{
                        backgroundColor: colorScheme.accentBackground,
                        padding: 10,
                        borderRadius: 10
                    }}>
                        <ThemeText fontSizeType={FontSizeTypes.error}
                                   style={{color: colorScheme.accentTextColor}}>{message ? "Попробовать ещё раз" : "Проверить"}</ThemeText>
                    </TouchableOpacity>
                </View>
            </> : null}
        </Limiter>
    )
}

/*

    bench test

    1 spread vs push

139,273
±0.83%
fastest
    const arr = [];
    for(let i = 0; i < 1000; i++){
        arr.push(i);
    }

65.82
±1.17%
100% slower
    let arr = [];
    for(let i = 0; i < 1000; i++){
        arr = [...arr, i];
    }


 */