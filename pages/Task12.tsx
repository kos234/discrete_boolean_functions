import {useWindowDimensions, View} from "react-native";
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
    getResidualInVector, UtilsReturn
} from "../utils/boolsUtils";
import {fastClearArray} from "../utils/useArrayState";

export default function Task12() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [rawVector, setRawVector] = useState<string>("");
    const [errorVector, setErrorVector] = useState(null);
    const [resMinDnf, setResMinDnf] = useState<UtilsReturn<ReactNode[]>>(null);

    function onVectorChange(value: string): void {
        const res = checkVectorCorrect(value);
        setErrorVector(res.error);
        if(!res.error){
            setResMinDnf(getMinDNFByMaxClass(res.value.vector, colorScheme));
        }
        setRawVector(res.value.vector);
    }
    //0001110101011100

    return (
        <Limiter>
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

            {errorVector ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{errorVector}</ThemeText>
            </View> : null}

            {resMinDnf && resMinDnf.error ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{resMinDnf.error}</ThemeText>
            </View> : null}


            {rawVector && !errorVector && resMinDnf && !resMinDnf.error ?
                <>
                    <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                        <ThemeText fontSizeType={FontSizeTypes.normal}>
                            ДНФ&nbsp;=&nbsp;
                        </ThemeText>
                        {resMinDnf.value}
                    </View>

                    {drawTableBoolFunction(rawVector, defaultStyle, colorScheme)}
                </>
                : null}


        </Limiter>
    );
}