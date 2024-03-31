import Limiter from "../components/Limiter";
import {useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess} from "../utils/utils";
import React, {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {getRandomVector, getResidualIndexes, getResidualInVector} from "../utils/boolsUtils";
import DropDown, {DropDownElement} from "../components/DropDown";
import useArrayState, {fastClearArray} from "../utils/useArrayState";
import CustomTouchableOpacity from "../components/CustomTouchableOpacity";
import useJSONState from "../utils/useJSONState";
import {err} from "react-native-svg";

const Task5ElemStatuses:DropDownElement[] = [{key: "false", value: "фиктивная"}, {key: "true", value: "существенная"}]
export default function Task5() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nValue, setNValue] = useState("");
    const [vector, setVector] = useState(null);
    const [errors, commitErrors] = useJSONState({vector: null, types: null});
    const [message, setMessage] = useState(null);
    const [dataSignificant, commitDataSignificant] = useArrayState<boolean | null>([]);

    function generateVector(value: string) {
        const n = parseInt(value);
        const res = getRandomVector(n);
        errors.current.vector = res.error;
        commitErrors();
        setVector(res.value);
        setNValue(value);

        dataSignificant.current = Array(n).fill(null);
        commitDataSignificant();
    }

    function checkAllSignifications():boolean{
        if(dataSignificant.current.find(item => item == null) !== undefined) {
            errors.current.types = "Укажите тип для каждой переменной!"
            commitErrors();
            return true;
        }
        errors.current.types = null;
        commitErrors();
        return false;
    }

    function checkCorrect() {
        if(message){
            const n = parseInt(nValue);
            dataSignificant.current = Array(n).fill(null);
            commitDataSignificant();
            setVector(getRandomVector(n).value);
            setMessage(null);
            return;
        }
        if(checkAllSignifications())
            return;

        const errorsTypes:string[] = [];

        for(let i = 0; i < dataSignificant.current.length; i++){
            const zeroResidual = getResidualIndexes(vector.length, i + 1, 0);
            const oneResidual = getResidualIndexes(vector.length, i + 1, 1);
            const type = getResidualInVector(vector, zeroResidual) != getResidualInVector(vector, oneResidual);

            if(dataSignificant.current[i] != type){
                errorsTypes.push("X" + (i + 1) + " это " + Task5ElemStatuses[+type].value + " переменная")
            }
        }

        if(errorsTypes.length === 0){
            setMessage({colorType: ColorTypes.success, value: "Правильно!"});
        }else{
            setMessage({colorType: ColorTypes.error, value: "Неправильно! " + errorsTypes.join(", ")});
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
                }} value={nValue} onInput={generateVector} typeInput={"numeric"} placeholder={"число"}
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

                <View style={{zIndex: 10, elevation: 10}}>
                    {dataSignificant.current.map((item, index) => (
                        <View key={index} style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 4 + (dataSignificant.current.length - index), elevation: 4 + (dataSignificant.current.length - index)}]}>
                            <ThemeText fontSizeType={FontSizeTypes.normal}>x<ThemeText fontSizeType={FontSizeTypes.sub}>{index + 1}</ThemeText> это </ThemeText>
                            <DropDown style={{width: 250}} elements={Task5ElemStatuses} defaultValue={item == undefined ? undefined : Task5ElemStatuses[+item].value} placeholder={"тип"} onSelect={(itm) => {
                                dataSignificant.current[index] = itm.key === "true";
                                commitDataSignificant();
                                checkAllSignifications();
                            }}/>
                        </View>
                    ))}
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