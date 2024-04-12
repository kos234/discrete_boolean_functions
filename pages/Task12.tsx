import {ScrollView, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import DropDown, {DropDownElement} from "../components/DropDown";
import {ReactNode, useContext, useEffect, useMemo, useRef, useState} from "react";
import {adaptiveLess, binSearch} from "../utils/utils";
import {AppContext} from "../colors";
import {
    checkVectorCorrect,
    drawTableBoolFunction,
    getMinDNFByMaxClass,
    getResidualIndexes,
    getResidualInVector, getStringBooleanFormatByVector, UtilsReturn
} from "../utils/boolsUtils";
import {fastClearArray} from "../utils/useArrayState";
import useErrorState from "../utils/useErrorState";

export default function Task12() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [rawVector, setRawVector] = useState<string>("");
    const [vectorError, isVectorError, setVectorError] = useErrorState(null, 0);

    const [resMinDnf, setResMinDnf] = useState<UtilsReturn<ReactNode[]>>(null);

    function onVectorChange(value: string): void {
        const res = checkVectorCorrect(value);
        setVectorError(res.error);
        if(!res.error){
            setResMinDnf(getMinDNFByMaxClass(res.value.vector, colorScheme));
        }
        setRawVector(res.value.vector);
    }
    //0001110101011100

    return (
        <Limiter notScroll={true} styleMain={{height: height - defaultStyle.fontSize_title.headerHeight}}>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите f: </ThemeText>
                <ThemeInput
                    style={{
                        marginLeft: 15,
                        flex: adaptiveLess(width, 0, {"478": 1}),
                        width: adaptiveLess(width, null, {"478": 2})
                    }}
                    value={rawVector} onInput={onVectorChange} typeInput={"numeric"} placeholder={"вектор"}
                    fontSizeType={FontSizeTypes.normal}
                    notDeleteFirstZero={true}/>
            </View>

            {vectorError ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{vectorError}</ThemeText>
            </View> : null}

            {resMinDnf && resMinDnf.error ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{resMinDnf.error}</ThemeText>
            </View> : null}


            {rawVector && !isVectorError.current && resMinDnf && !resMinDnf.error ?
                <>
                    <View style={[defaultStyle.marginTopNormal, {flexDirection: adaptiveLess(width, 1, {"478": 0}) ? "row" : "column"}]}>
                        <ThemeText fontSizeType={FontSizeTypes.normal}>
                            ДНФ =&nbsp;
                        </ThemeText>
                        <ScrollView horizontal={true}>
                            {resMinDnf.value}
                        </ScrollView>
                    </View>

                    {drawTableBoolFunction(rawVector, defaultStyle, colorScheme)}
                </>
                : null}


        </Limiter>
    );
}