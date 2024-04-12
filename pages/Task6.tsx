import Limiter from "../components/Limiter";
import {ScrollView, TouchableOpacity, useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, safeToString} from "../utils/utils";
import React, {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {DNF, drawTableBoolFunction, getRandomVector, getValueINDNF, parseDNF} from "../utils/boolsUtils";
import {DropDownElement} from "../components/DropDown";
import useJSONState from "../utils/useJSONState";
import useErrorState from "../utils/useErrorState";

const Task5ElemStatuses: DropDownElement[] = [{key: "false", value: "фиктивная"}, {key: "true", value: "существенная"}]
export default function Task6() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nValue, setNValue] = useState<number>();
    const [vector, setVector] = useState<string>(null);
    const [vectorError, isVectorError, setVectorError] = useErrorState(null, 0);
    const [dnfError, isDNFError, setDNFError] = useErrorState(null);
    const [message, setMessage] = useState<{ colorType: ColorTypes, value: string }>(null);
    const [rawDNF, setRawDNF] = useState("");
    const dnfRef = useRef<DNF>(null);

    function generateVector(value: string) {
        const n = parseInt(value);
        const res = getRandomVector(n);
        setVectorError(res.error);
        setVector(res.value);
        setNValue(n);
    }

    function onInputDNF(value: string) {
        setRawDNF(value);

        const res = parseDNF(value, true);
        console.log("DNF", res.value.storage);
        setDNFError(res.error);

        if (res.error)
            return;
        if (nValue < res.value.getMaxPow()) {
            setDNFError(`Количество переменных в ДНФ больше чем в векторе - ${res.value.getMaxPow()}`);
            return;
        }

        dnfRef.current = res.value;
    }

    function onClick() {
        if(message){
            onInputDNF("");
            setVector(getRandomVector(nValue).value);
            setMessage(null);
            return;
        }

        if(rawDNF.length === 0){
            setDNFError("Введите ДНФ!");
        }

        if(isDNFError.current || isVectorError.current)
            return;

        for (let i = 0; i < 1 << nValue; i++) {
            if (getValueINDNF(i, nValue, dnfRef.current) + "" !== vector[i]) {
                setMessage({value: "Неправильный ДНФ!", colorType: ColorTypes.error});
                return;
            }
        }

        setMessage({value: "Правильно!", colorType: ColorTypes.success});
    }

    return (
        <Limiter notScroll={true} styleMain={{height: height - defaultStyle.fontSize_title.headerHeight}}>
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
                    <ThemeText fontSizeType={FontSizeTypes.normal}>Введите ДНФ:  </ThemeText>
                    <ThemeInput
                        style={{
                            width: adaptiveLess(width, null, {"478": "100%"})
                        }}
                        value={rawDNF} onInput={onInputDNF}
                        placeholder={"ДНФ"}
                        fontSizeType={FontSizeTypes.normal}/>
                </View>

                {dnfError ? <View style={defaultStyle.marginTopSmall}>
                    <ThemeText colorType={ColorTypes.error}
                               fontSizeType={FontSizeTypes.error}>{dnfError}</ThemeText>
                </View> : null}

                {message ? <>
                    {drawTableBoolFunction(vector, defaultStyle, colorScheme, undefined, dnfRef.current)}
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