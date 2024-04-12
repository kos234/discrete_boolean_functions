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
import useErrorState from "../utils/useErrorState";


export default function Task3() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [zeroResidual, setZeroResidual] = useState<string>("");
    const [oneResidual, setOneResidual] = useState<string>("");
    const [zeroResidualError, isZeroResidualError, setZeroResidualError] = useErrorState(null);
    const [oneResidualError, isOneResidualError, setOneResidualError] = useErrorState(null);
    const [rawArgument, setRawArgument] = useState<string>("");
    const refArguments = useRef<DropDownElement[]>([]);
    const residualIndexes = useMemo(() => getResidualIndexes(zeroResidual.length * 2, parseInt(rawArgument), 0),
        [zeroResidual, oneResidual, rawArgument]);
    const vector = useMemo(() => glueVectorOnResiduals(zeroResidual, oneResidual, residualIndexes), [zeroResidual, oneResidual, residualIndexes]);

    function onResidualChange(value: string, isZero: boolean = true): void {
        const resForZero = checkVectorCorrect(isZero ? value : zeroResidual);
        const resForOne = checkVectorCorrect(isZero ? oneResidual : value);
        setZeroResidualError(resForZero.error);
        setOneResidualError(resForOne.error);

        marker: {
            if (!isZeroResidualError.current && !isOneResidualError.current)
                if (resForZero.value.vector.length != resForOne.value.vector.length) {
                    setZeroResidualError("Длина векторов должна быть одинакова!");
                    setOneResidualError("Длина векторов должна быть одинакова!");
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
        if (isZero)
            setZeroResidual(resForZero.value.vector);
        else
            setOneResidual(resForOne.value.vector);
    }

    function selectArgument(item: DropDownElement): void {
        setRawArgument(item.key);
    }

    return (
        <Limiter notScroll={true} styleMain={{height: height - defaultStyle.fontSize_title.headerHeight}}>
            <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите нулевую остаточную:  </ThemeText>
                <ThemeInput
                    style={{width: adaptiveLess(width, null, {"900": "100%"})}}
                    value={zeroResidual} onInput={(r: string) => onResidualChange(r, true)} typeInput={"numeric"}
                    placeholder={"остаточная"}
                    fontSizeType={FontSizeTypes.normal}
                    notDeleteFirstZero={true}/>
            </View>

            {zeroResidualError ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{zeroResidualError}</ThemeText>
            </View> : null}

            <View style={[{flexDirection: "row", flexWrap: "wrap"}, defaultStyle.marginTopNormal]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите единичную остаточную:  </ThemeText>
                <ThemeInput
                    style={{width: adaptiveLess(width, null, {"900": "100%"})}}
                    value={oneResidual} onInput={(r: string) => onResidualChange(r, false)} typeInput={"numeric"}
                    placeholder={"остаточная"}
                    fontSizeType={FontSizeTypes.normal}
                    notDeleteFirstZero={true}/>
            </View>

            {oneResidualError ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{oneResidualError}</ThemeText>
            </View> : null}

            <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 3, flexWrap: "wrap"}]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Выберите аргумент: </ThemeText>
                <DropDown elements={refArguments.current} onSelect={selectArgument}
                          defaultValue={rawArgument ? refArguments.current.find((item) => item.key === rawArgument).value : null}
                          placeholder={"аргумент"}></DropDown>
            </View>

            {zeroResidual && oneResidual && !isOneResidualError.current && !isZeroResidualError.current && rawArgument ?
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