import Limiter from "../components/Limiter";
import {TouchableOpacity, useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, safeToString} from "../utils/utils";
import React, {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {DNF, drawTableBoolFunction, getRandomVector, getValueINDNF, parseDNF} from "../utils/boolsUtils";
import {DropDownElement} from "../components/DropDown";
import useJSONState from "../utils/useJSONState";

const Task5ElemStatuses: DropDownElement[] = [{key: "false", value: "фиктивная"}, {key: "true", value: "существенная"}]
export default function Task6() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nValue, setNValue] = useState<number>();
    const [vector, setVector] = useState<string>(null);
    const [errors, commitErrors] = useJSONState({vector: null, DNF: null});
    const [message, setMessage] = useState<{ colorType: ColorTypes, value: string }>(null);
    const [rawDNF, setRawDNF] = useState("");
    const dnfRef = useRef<DNF>(null);

    function generateVector(value: string) {
        const n = parseInt(value);
        const res = getRandomVector(n);
        errors.current.vector = res.error;
        commitErrors();
        setVector(res.value);
        setNValue(n);
    }

    function onInputDNF(value: string) {
        setRawDNF(value);

        const res = parseDNF(value, true);
        console.log("DNF", res.value);
        errors.current.DNF = res.error;
        commitErrors();

        if (res.error)
            return;
        if (nValue < res.value.getMaxPow()) {
            errors.current.DNF = `Количество переменных в ДНФ больше чем в векторе - ${res.value.getMaxPow()}`;
            commitErrors();
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
            errors.current.DNF = "Введите ДНФ!";
            commitErrors();
        }

        if(errors.current.DNF || errors.current.vector)
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
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите n: </ThemeText>
                <ThemeInput style={{
                    marginLeft: 15,
                    flex: adaptiveLess(width, 0, {"478": 1}),
                    width: adaptiveLess(width, null, {"478": 2})
                }} value={safeToString(nValue)} onInput={generateVector} typeInput={"numeric"} placeholder={"число"}
                            fontSizeType={FontSizeTypes.normal}/>
            </View>
            {errors.current.vector ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{errors.current.vector}</ThemeText>
            </View> : null}

            {vector && nValue ? <>
                <View style={defaultStyle.marginTopNormal}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>f = ({vector})</ThemeText>
                </View>

                <View style={[{flexDirection: "row"}, defaultStyle.marginTopNormal]}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>Введите ДНФ: </ThemeText>
                    <ThemeInput
                        style={{
                            marginLeft: 15,
                            flex: adaptiveLess(width, 0, {"478": 1}),
                            width: adaptiveLess(width, null, {"478": 2})
                        }}
                        value={rawDNF} onInput={onInputDNF}
                        placeholder={"ДНФ"}
                        fontSizeType={FontSizeTypes.normal}/>
                </View>

                {errors.current.DNF ? <View style={defaultStyle.marginTopSmall}>
                    <ThemeText colorType={ColorTypes.error}
                               fontSizeType={FontSizeTypes.error}>{errors.current.DNF}</ThemeText>
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