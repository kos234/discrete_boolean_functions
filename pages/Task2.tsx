import {FlatList, StyleSheet, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import DropDown from "../components/DropDown";
import {useContext, useRef, useState} from "react";
import {adaptiveLess, forTo, getRandom, range} from "../utils";
import {ThemeContext} from "../colors";
import Table, {TableColumn, TableRow} from "../components/Table";

export default function Task1() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(ThemeContext);
    const [rawVector, setRawVector] = useState("");
    const [rawResidual, setRawResidual] = useState("");
    const [rawArgument, setRawArgument] = useState("");
    const [errorVector, setErrorVector] = useState(null);

    function onVectorChange(value: string): void {
        value = value.replaceAll(/[^01]/g, "");
        vectorManipulation: {
            if (value.length === 0)
                break vectorManipulation;

            const argsCount = Math.log2(value.length);
            if (argsCount == 0 || argsCount % 1 !== 0) {
                const lower = Math.pow(2, Math.floor(argsCount));
                if (argsCount == 0)
                    setErrorVector("Длина вектора должна быть больше 1");
                else
                    setErrorVector("Возможная длина вектора: " + lower + " или " + (lower * 2));
            } else {
                setErrorVector("");
            }
        }

        setRawVector(value);
    }

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите f(n): </ThemeText>
                <ThemeInput
                    style={{marginLeft: 15, flex: adaptiveLess(width, 0, {"478": 1}), width: adaptiveLess(width, null, {"478": 2})}}
                    value={rawVector} onInput={onVectorChange} typeInput={"numeric"} placeholder={"вектор"}
                    fontSizeType={FontSizeTypes.normal}
                    notDeleteFirstZero={true}/>
            </View>

            {errorVector ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{errorVector}</ThemeText>
            </View> : null}

            <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 2}]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Выберите аргумент: </ThemeText>
                <DropDown style={{zIndex: 2}} elements={range(100).map(i => {
                    return {key: "" + i, value: "x" + i}
                })} defaultValue={"test"}></DropDown>
            </View>
            {/*<View>*/}
            {/*    Lorem ipsum dolor sit amet, consectetur adipisicing elit. A, eveniet minus neque nihil placeat qui quibusdam ratione sit soluta tempora.*/}
            {/*</View>*/}

            {/*<View style={{flexDirection: "row"}}>*/}
            {/*    <ThemeText fontSizeType={FontSizeTypes.normal}>Введите f(n): </ThemeText>*/}
            {/*    <ThemeInput*/}
            {/*        style={{marginLeft: 15, flex: adaptiveLess(width, 0, {"478": 1}), width: adaptiveLess(width, null, {"478": 2})}}*/}
            {/*        value={rawVector} onInput={onVectorChange} typeInput={"numeric"} placeholder={"вектор"}*/}
            {/*        fontSizeType={FontSizeTypes.normal}*/}
            {/*        notDeleteFirstZero={true}/>*/}
            {/*</View>*/}
        </Limiter>
    );
}