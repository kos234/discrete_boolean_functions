import {DefaultProps} from "../globalStyles";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import {TouchableOpacity, View} from "react-native";
import {getRandomVector} from "../utils/boolsUtils";
import DropDown, {DropDownElement} from "../components/DropDown";
import React, {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {getRandom} from "../utils/utils";

export default function Task4() {
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nameFunction, setNameFunction] = useState<DropDownElement>(null);
    const [status, setStatus] = useState<{ colorType: ColorTypes, value: string }>(null);
    const refResiduals = useRef<DropDownElement[]>([
        {key: "0001", value: "конъюнкция"},
        {key: "0111", value: "дизъюнкция"},
        {key: "0110", value: "сложение"},
        {key: "1001", value: "эквивалентность"},
        {key: "1110", value: "штрих Шеффера"},
        {key: "1000", value: "стрелка Пирса"},
        {key: "1101", value: "импликация"},
        {key: "1011", value: "обратная импликация"},
        {key: "0010", value: "коимпликация"},
        {key: "0100", value: "обратная коимпликация"},
        {key: "0100", value: "переменная x"},
        {key: "0001", value: "переменная y"},
        {key: "1000", value: "отрицание x"},
        {key: "0010", value: "отрицание y"},
        {key: "0000", value: "0"},
        {key: "1111", value: "1"},
    ]);
    const [vector, setVector] = useState(getRandomNamedVector());


    function getRandomNamedVector(): string {
        return refResiduals.current.map(item => item.key)[Math.floor(getRandom(0, refResiduals.current.length))];
    }

    function setRawNameFunction(item: DropDownElement) {
        if (status)
            if (nameFunction)
                return;
            else
                setStatus(null);
        setNameFunction(item);
    }

    function checkCorrect() {
        if (nameFunction === null) {
            setStatus({colorType: ColorTypes.error, value: "Сначала укажите имя функции!"});
            return;
        }
        
        if (status) {
            setStatus(null);
            setNameFunction(null);
            setVector(getRandomNamedVector());
            return;
        }

        if (vector === nameFunction.key) {
            setStatus({colorType: ColorTypes.success, value: "Правильно! Это " + nameFunction.value});
        } else {
            setStatus({
                colorType: ColorTypes.error,
                value: "Неправильно! Это " + refResiduals.current.find(item => item.key === vector).value
            });
        }
    }

    return (
        <Limiter>
            <View style={{zIndex: 10, elevation: 10}}>
                <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>f(x, y) = ({vector}) -
                        это </ThemeText>

                    <DropDown defaultValue={nameFunction ? nameFunction.value : null} style={{width: 300}}
                              elements={refResiduals.current} onSelect={setRawNameFunction} placeholder={"имя функции"}/>
                </View>
            </View>

            {status ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={status.colorType}
                           fontSizeType={FontSizeTypes.error}>{status.value}</ThemeText>
            </View> : null}

            <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                <TouchableOpacity onPress={checkCorrect} style={{
                    backgroundColor: colorScheme.accentBackground,
                    padding: 10,
                    borderRadius: 10
                }}>
                    <ThemeText fontSizeType={FontSizeTypes.error}
                               style={{color: colorScheme.accentTextColor}}>{status && nameFunction ? "Попробовать ещё раз" : "Проверить"}</ThemeText>
                </TouchableOpacity>
            </View>
        </Limiter>
    )
}