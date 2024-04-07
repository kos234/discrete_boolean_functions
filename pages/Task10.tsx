import Limiter from "../components/Limiter";
import {TouchableOpacity, useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, safeToString} from "../utils/utils";
import React, {ReactNode, useContext, useState} from "react";
import {AppContext} from "../colors";
import {checkPreFullClases, getRandomVector, getResidualIndexes, getResidualInVector} from "../utils/boolsUtils";
import DropDown, {DropDownElement} from "../components/DropDown";
import useArrayState from "../utils/useArrayState";
import useJSONState from "../utils/useJSONState";

const Task10ElemStatuses:DropDownElement[] = [{key: "false", value: "не принадлежит"}, {key: "true", value: "принадлежит"}]
const Task10DropDowns:ReactNode[] = [
    <>T<ThemeText fontSizeType={FontSizeTypes.sub}>0</ThemeText></>,
    <>T<ThemeText fontSizeType={FontSizeTypes.sub}>1</ThemeText></>,
    <>S</>,
    <>M</>,
    <>L</>,
]
export default function Task10() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nValue, setNValue] = useState<number>(null);
    const [vector, setVector] = useState(null);
    const [errors, commitErrors] = useJSONState({vector: null, types: null});
    const [message, setMessage] = useState(null);
    const [dataClases, commitDataClases] = useArrayState<boolean | null>([]);

    function generateVector(value: string) {
        const n = parseInt(value);
        const res = getRandomVector(n);
        errors.current.vector = res.error;
        commitErrors();
        setVector(res.value);
        setNValue(Number.isNaN(n) ? null : n);

        dataClases.current = Array(Task10DropDowns.length).fill(null);
        commitDataClases();
    }

    function checkAllSignifications():boolean{
        if(dataClases.current.find(item => item == null) !== undefined) {
            errors.current.types = "Укажите принадлежность для каждого класса!"
            commitErrors();
            return true;
        }
        errors.current.types = null;
        commitErrors();
        return false;
    }

    function checkCorrect() {
        if(message){
            dataClases.current = Array(Task10DropDowns.length).fill(null);
            commitDataClases();
            setVector(getRandomVector(nValue).value);
            setMessage(null);
            return;
        }
        if(checkAllSignifications())
            return;

        const errorsTypes:string[] = [];

        const correctRes = checkPreFullClases(vector);

        if(correctRes.t0 != dataClases.current[0])
            errorsTypes.push(Task10ElemStatuses[+correctRes.t0].value + " классу T0");
        if(correctRes.t1 != dataClases.current[1])
            errorsTypes.push(Task10ElemStatuses[+correctRes.t1].value + " классу T1");
        if(correctRes.s != dataClases.current[2])
            errorsTypes.push(Task10ElemStatuses[+correctRes.s].value + " классу S");
        if(correctRes.m != dataClases.current[3])
            errorsTypes.push(Task10ElemStatuses[+correctRes.m].value + " классу M");
        if(correctRes.l != dataClases.current[4])
            errorsTypes.push(Task10ElemStatuses[+correctRes.l].value + " классу L");
        if(errorsTypes.length === 0){
            setMessage({colorType: ColorTypes.success, value: "Правильно!"});
        }else{
            setMessage({colorType: ColorTypes.error, value: "Неправильно! Функция " + errorsTypes.join(", ")});
        }
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

                <>
                    {dataClases.current.map((item, index) => (
                        <View key={index} style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 4 + (dataClases.current.length - index), elevation: 4 + (dataClases.current.length - index)}]}>
                            <ThemeText fontSizeType={FontSizeTypes.small}>{Task10DropDowns[index]}:&nbsp;&nbsp;</ThemeText>
                            <DropDown style={{width: 250}} elements={Task10ElemStatuses} defaultValue={item == undefined ? undefined : Task10ElemStatuses[+item].value} placeholder={"принадлежность"} onSelect={(itm) => {
                                dataClases.current[index] = itm.key === "true";
                                commitDataClases();
                                checkAllSignifications();
                            }}/>
                        </View>
                    ))}
                </>

                {errors.current.types ? <View style={defaultStyle.marginTopSmall}>
                    <ThemeText colorType={ColorTypes.error}
                               fontSizeType={FontSizeTypes.error}>{errors.current.types}</ThemeText>
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