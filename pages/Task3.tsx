import {Platform, Text, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {AppContext} from "../colors";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, binSearch} from "../utils/utils";
import {
    checkVectorCorrect,
    drawTableBoolFunction,
    getResidualIndexes,
    glueVectorOnResiduals
} from "../utils/boolsUtils";
import DropDown, {DropDownElement} from "../components/DropDown";


export default function Task3() {
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const {height, width} = useWindowDimensions();
    const [zeroResidual, setZeroResidual] = useState<string>("");
    const [oneResidual, setOneResidual] = useState<string>("");
    const [errors, setErrors] = useState({errorZeroResidual: "", errorOneResidual: ""});
    const [rawArgument, setRawArgument] = useState<string>("");
    const refArguments = useRef<DropDownElement[]>([]);
    const residualIndexes = useMemo(() => getResidualIndexes(zeroResidual.length * 2, parseInt(rawArgument), 0),
        [zeroResidual, oneResidual, rawArgument]);
    const vector = useMemo(() => glueVectorOnResiduals(zeroResidual, oneResidual, residualIndexes), [zeroResidual, oneResidual, residualIndexes]);

    function onResidualChange(value: string, isZero: boolean = true): void {
        const newError = {errorZeroResidual: "", errorOneResidual: ""};
        const resForZero = checkVectorCorrect(isZero ? value : zeroResidual);
        const resForOne = checkVectorCorrect(isZero ? oneResidual : value);
        newError.errorZeroResidual = resForZero.error;
        const rawZeroResidual = resForZero.value.vector;
        newError.errorOneResidual = resForOne.error;
        const rawOneResidual = resForOne.value.vector;

        marker: {
            if (!newError.errorZeroResidual && !newError.errorOneResidual)
                if (rawZeroResidual.length != rawOneResidual.length) {
                    newError.errorZeroResidual = "Длина векторов должна быть одинакова!";
                    newError.errorOneResidual = newError.errorZeroResidual;
                    break marker;
                }

            refArguments.current = [];
            for (let i = 1; i <= resForZero.value.argsCount + 1; i++) {
                refArguments.current.push({
                    key: "" + i,
                    value: (<>
                        x<ThemeText fontSizeType={FontSizeTypes.sub}>{i}</ThemeText>
                    </>)
                })
            }

            if (refArguments.current.length < parseInt(rawArgument))
                setRawArgument("");
        }
        setErrors(newError);
        if (isZero)
            setZeroResidual(rawZeroResidual);
        else
            setOneResidual(rawOneResidual);
    }

    function selectArgument(item: DropDownElement): void {
        setRawArgument(item.key);
    }

    console.log("RENDER TASK3")

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите нулевую остаточную: </ThemeText>
                <ThemeInput
                    style={{
                        marginLeft: 15,
                        flex: adaptiveLess(width, 0, {"478": 1}),
                        width: adaptiveLess(width, null, {"478": 2})
                    }}
                    value={zeroResidual} onInput={(r: string) => onResidualChange(r, true)} typeInput={"numeric"}
                    placeholder={"остаточная"}
                    fontSizeType={FontSizeTypes.normal}
                    notDeleteFirstZero={true}/>
            </View>

            {errors.errorZeroResidual ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{errors.errorZeroResidual}</ThemeText>
            </View> : null}

            <View style={[{flexDirection: "row"}, defaultStyle.marginTopNormal]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите единичную остаточную: </ThemeText>
                <ThemeInput
                    style={{
                        marginLeft: 15,
                        flex: adaptiveLess(width, 0, {"478": 1}),
                        width: adaptiveLess(width, null, {"478": 2})
                    }}
                    value={oneResidual} onInput={(r: string) => onResidualChange(r, false)} typeInput={"numeric"}
                    placeholder={"остаточная"}
                    fontSizeType={FontSizeTypes.normal}
                    notDeleteFirstZero={true}/>
            </View>

            {errors.errorOneResidual ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{errors.errorOneResidual}</ThemeText>
            </View> : null}

            <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 3}]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Выберите аргумент: </ThemeText>
                <DropDown elements={refArguments.current} onSelect={selectArgument}
                          defaultValue={rawArgument ? refArguments.current.find((item) => item.key === rawArgument).value : null}
                          placeholder={"аргумент"}></DropDown>
            </View>

            {zeroResidual && oneResidual && !errors.errorZeroResidual && !errors.errorOneResidual && rawArgument ?
                <>
                    <View style={defaultStyle.marginTopNormal}>
                        <ThemeText fontSizeType={FontSizeTypes.normal}>f = ({vector})</ThemeText>
                    </View>

                    {drawTableBoolFunction(vector, defaultStyle, colorScheme, (row, column) => {
                        if (binSearch<number>(row - 1, residualIndexes, (a, b) => a - b) != undefined)
                            return {fontWeight: "bold"}
                        return {}
                    })}
                </> : null}
        </Limiter>
    );
}