import {useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import DropDown, {DropDownElement} from "../components/DropDown";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {adaptiveLess, binSearch} from "../utils/utils";
import {AppContext} from "../colors";
import {checkVectorCorrect, drawTableBoolFunction, getResidualIndexes, getResidualInVector} from "../utils/boolsUtils";
import {fastClearArray} from "../utils/useArrayState";
import useErrorState from "../utils/useErrorState";

export default function Task2() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [rawVector, setRawVector] = useState<string>("");
    const [rawResidual, setRawResidual] = useState<string>("");
    const [rawArgument, setRawArgument] = useState<string>("");
    const [errorVector, isErrorVector, setErrorVector] = useErrorState(null);
    const refArguments = useRef<DropDownElement[]>([]);
    const refResiduals = useRef<DropDownElement[]>([{key: "0", value: "0"}, {key: "1", value: "1"}]);
    const residualIndexes = useMemo<number[]>(() => getResidualIndexes(rawVector.length, parseInt(rawArgument), parseInt(rawResidual)),
        [rawVector, rawArgument, rawResidual]);

    function onVectorChange(value: string): void {
        const res = checkVectorCorrect(value);
        setErrorVector(res.error);

        if(!res.error) {
            fastClearArray(refArguments.current);
            for (let i = 1; i <= res.value.argsCount; i++) {
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
        setRawVector(res.value.vector);
    }

    function selectArgument(item: DropDownElement): void {
        setRawArgument(item.key);
    }

    function selectResidual(item: DropDownElement): void {
        setRawResidual(item.key);
    }

    return (
        <Limiter notScroll={true} styleMain={{height: height - defaultStyle.fontSize_title.headerHeight}}>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите&nbsp;f:&nbsp;&nbsp;</ThemeText>
                <ThemeInput
                    style={{
                        flex: adaptiveLess(width, 0, {"478": 1}),
                        width: adaptiveLess(width, null, {"478": 2})
                    }}
                    value={rawVector} onInput={onVectorChange} typeInput={"numeric"} placeholder={"вектор"}
                    fontSizeType={FontSizeTypes.normal}
                    notDeleteFirstZero={true}/>
            </View>

            {errorVector ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{errorVector}</ThemeText>
            </View> : null}

            <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 3, flexWrap: "wrap"}]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Выберите&nbsp;аргумент:&nbsp;&nbsp;</ThemeText>
                <DropDown elements={refArguments.current} onSelect={selectArgument}
                          defaultValue={rawArgument ? refArguments.current.find((item) => item.key === rawArgument).value : null}
                          placeholder={"аргумент"}></DropDown>
            </View>

            <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 2, flexWrap: "wrap"}]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Выберите&nbsp;остаточную:&nbsp;&nbsp;</ThemeText>
                <DropDown elements={refResiduals.current} onSelect={selectResidual} defaultValue={rawResidual}
                          placeholder={"остаточная"}></DropDown>
            </View>

            {rawVector && rawArgument && rawResidual && !isErrorVector.current ?
                <>
                    <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                        <View style={{flexDirection: "row"}}>
                            <ThemeText fontSizeType={FontSizeTypes.normal}>
                                f
                            </ThemeText>
                            <View style={{flexDirection: "column", marginLeft: 4}}>
                                <ThemeText fontSizeType={FontSizeTypes.sub}>{rawResidual || " "}</ThemeText>
                                <ThemeText fontSizeType={FontSizeTypes.sub}>x{rawArgument}</ThemeText>
                            </View>
                        </View>
                        <ThemeText fontSizeType={FontSizeTypes.normal}>
                            &nbsp;= ({getResidualInVector(rawVector, residualIndexes)})
                        </ThemeText>
                    </View>


                    {drawTableBoolFunction(rawVector, defaultStyle, colorScheme, (row, column) => {
                            if(binSearch<number>(row-1, residualIndexes, (a, b) => a - b) != undefined)
                                return {fontWeight: "bold"}
                        return {}
                    })}
                </>
                : null}


        </Limiter>
    );
}