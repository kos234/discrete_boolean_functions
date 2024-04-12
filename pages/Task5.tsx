import Limiter from "../components/Limiter";
import {TouchableOpacity, useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, safeToString} from "../utils/utils";
import React, {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {getRandomVector, getResidualIndexes, getResidualInVector} from "../utils/boolsUtils";
import DropDown, {DropDownElement} from "../components/DropDown";
import useArrayState, {fastClearArray} from "../utils/useArrayState";
import useJSONState from "../utils/useJSONState";
import {err} from "react-native-svg";
import useErrorState from "../utils/useErrorState";

const Task5ElemStatuses: DropDownElement[] = [{key: "false", value: "фиктивная"}, {key: "true", value: "существенная"}]
export default function Task5() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nValue, setNValue] = useState<number | null>(null);
    const [vector, setVector] = useState(null);
    const [vectorError, isVectorError, setVectorError] = useErrorState(null, 0);
    const [typesError, isTypesError, setTypesVector] = useErrorState(null);
    const [message, setMessage] = useState(null);
    const [dataSignificant, commitDataSignificant] = useArrayState<boolean | null>([]);

    function generateVector(value: string) {
        const n = parseInt(value);
        const res = getRandomVector(n);
        setVectorError(res.error);
        setVector(res.value);
        setNValue(n);

        if (n >= 0)
            dataSignificant.current = Array(n).fill(null);
        else
            dataSignificant.current = []
        commitDataSignificant();
    }

    function checkAllSignifications(): boolean {
        if (dataSignificant.current.find(item => item == null) !== undefined) {
            setTypesVector("Укажите тип для каждой переменной!");
            return true;
        }
        setTypesVector(null);
        return false;
    }

    function checkCorrect() {
        if (message) {
            dataSignificant.current = Array(nValue).fill(null);
            commitDataSignificant();
            setVector(getRandomVector(nValue).value);
            setMessage(null);
            return;
        }
        if (checkAllSignifications())
            return;

        const errorsTypes: string[] = [];

        for (let i = 0; i < dataSignificant.current.length; i++) {
            const zeroResidual = getResidualIndexes(vector.length, i + 1, 0);
            const oneResidual = getResidualIndexes(vector.length, i + 1, 1);
            const type = getResidualInVector(vector, zeroResidual) != getResidualInVector(vector, oneResidual);

            if (dataSignificant.current[i] != type) {
                errorsTypes.push("X" + (i + 1) + " это " + Task5ElemStatuses[+type].value + " переменная")
            }
        }

        if (errorsTypes.length === 0) {
            setMessage({colorType: ColorTypes.success, value: "Правильно!"});
        } else {
            setMessage({colorType: ColorTypes.error, value: "Неправильно! " + errorsTypes.join(", ")});
        }
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
                <View style={defaultStyle.marginTopNormal}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>f = ({vector})</ThemeText>
                </View>

                <View style={{zIndex: 10, elevation: 10}}>
                    {dataSignificant.current.map((item, index) => (
                        <View key={index} style={[defaultStyle.marginTopNormal, {
                            flexDirection: "row",

                            zIndex: 4 + (dataSignificant.current.length - index),
                            elevation: 4 + (dataSignificant.current.length - index)
                        }]}>
                            <ThemeText fontSizeType={FontSizeTypes.normal}>x<ThemeText
                                fontSizeType={FontSizeTypes.sub}>{index + 1}</ThemeText>&nbsp;это&nbsp;</ThemeText>
                            <DropDown
                                style={{width: adaptiveLess(width, 250, {"900": null}),
                                    flex: adaptiveLess(width, null, {"900": 1})}}
                                      elements={Task5ElemStatuses}
                                      defaultValue={item == undefined ? undefined : Task5ElemStatuses[+item].value}
                                      placeholder={"тип"} onSelect={(itm) => {
                                dataSignificant.current[index] = itm.key === "true";
                                commitDataSignificant();
                                checkAllSignifications();
                            }}/>
                        </View>
                    ))}
                </View>

                {typesError ? <View style={defaultStyle.marginTopSmall}>
                    <ThemeText colorType={ColorTypes.error}
                               fontSizeType={FontSizeTypes.error}>{typesError}</ThemeText>
                </View> : null}

                {message ? <View style={defaultStyle.marginTopSmall}>
                    <ThemeText colorType={message.colorType}
                               fontSizeType={FontSizeTypes.error}>{message.value}</ThemeText>
                </View> : null}

                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                    <TouchableOpacity onPress={checkCorrect} style={{
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