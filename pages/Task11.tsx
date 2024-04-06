import Limiter from "../components/Limiter";
import {useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, getRandom, safeToString} from "../utils/utils";
import React, {ReactNode, useContext, useState} from "react";
import {AppContext} from "../colors";
import {checkPreFullClases, getRandomVector, getResidualIndexes, getResidualInVector} from "../utils/boolsUtils";
import DropDown, {DropDownElement} from "../components/DropDown";
import useArrayState from "../utils/useArrayState";
import CustomTouchableOpacity from "../components/CustomTouchableOpacity";
import useJSONState from "../utils/useJSONState";

const Task11ElemStatuses: DropDownElement[] = [
    {key: "full", value: "система полная"},
    {key: "t0", value: "T0"},
    {key: "t1", value: "T1"},
    {key: "s", value: "S"},
    {key: "m", value: "M"},
    {key: "l", value: "L"},
]
export default function Task11() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nValue, setNValue] = useState<number>(null);
    const [vectors, setVectors] = useState<string[]>(null);
    const [errors, commitErrors] = useJSONState({vector: null, types: null});
    const [message, setMessage] = useState(null);
    const [ans, setAns] = useState<number | null>(null);

    function generateVector(value: string) {
        const n = parseInt(value);
        const vectorsCount = Math.floor(getRandom(1, 5));
        const vectorArray = [];
        for (let i = 0; i < vectorsCount; i++) {
            const res = getRandomVector(n);
            errors.current.vector = res.error;
            vectorArray.push(res.value);
        }
        commitErrors();
        setVectors(vectorArray);
        setNValue(Number.isNaN(n) ? null : n);
    }

    function checkCorrect() {
        if (message) {
            setAns(null)
            generateVector(nValue + "");
            setMessage(null);
            return;
        }
        if (ans == null) {
            errors.current.types = "Укажите класс или полноту!"
            commitErrors();
            return;
        }

        const globalRes: ReturnType<typeof checkPreFullClases> = {
            t0: true,
            t1: true,
            s: true,
            m: true,
            l: true,
        };

        for (let i = 0; i < vectors.length; i++) {
            const correctRes = checkPreFullClases(vectors[i]);
            for (let key of Object.keys(correctRes)) {
                globalRes[key] &= correctRes[key];
            }
        }

        const lockClass = Task11ElemStatuses.filter(item => globalRes[item.key])

        let ansMessage = {colorType: ColorTypes.success, value: "Правильно!"};
        if (ans === 0) {
            if (lockClass.length)
                ansMessage = {
                    colorType: ColorTypes.error,
                    value: "Неправильно! Набор замкнут относительно " + lockClass.map(item => item.value).join(", ")
                };
        } else {
            if (lockClass.length === 0)
                ansMessage = {colorType: ColorTypes.error, value: "Неправильно! Набор полон"};
            else if (lockClass.find(item => item.key === Task11ElemStatuses[ans].key) == null)
                ansMessage = {
                    colorType: ColorTypes.error,
                    value: "Неправильно! Набор замкнут относительно " + lockClass.map(item => item.value).join(", ")
                };
        }

        setMessage(ansMessage);
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

            {vectors && nValue ? <>
                <View style={defaultStyle.marginTopNormal}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>A = {"{(" + vectors.join("), (") + ")}"}</ThemeText>
                </View>


                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 4, elevation: 4}]}>
                    <ThemeText fontSizeType={FontSizeTypes.small}>Замкнутый класс:&nbsp;&nbsp;</ThemeText>
                    <DropDown style={{width: 300}} elements={Task11ElemStatuses}
                              defaultValue={ans == null ? null : Task11ElemStatuses[ans].value}
                              placeholder={"класс или полнота"} onSelect={(itm) => {
                        setAns(Task11ElemStatuses.findIndex(item => item.key === itm.key))
                    }}/>
                </View>

                {errors.current.types ? <View style={defaultStyle.marginTopSmall}>
                    <ThemeText colorType={ColorTypes.error}
                               fontSizeType={FontSizeTypes.error}>{errors.current.types}</ThemeText>
                </View> : null}

                {message ? <View style={defaultStyle.marginTopSmall}>
                    <ThemeText colorType={message.colorType}
                               fontSizeType={FontSizeTypes.error}>{message.value}</ThemeText>
                </View> : null}

                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                    <CustomTouchableOpacity onPress={checkCorrect} style={{
                        backgroundColor: colorScheme.accentBackground,
                        padding: 10,
                        borderRadius: 10
                    }}>
                        <ThemeText fontSizeType={FontSizeTypes.error}
                                   style={{color: colorScheme.accentTextColor}}>{message ? "Попробовать ещё раз" : "Проверить"}</ThemeText>
                    </CustomTouchableOpacity>
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