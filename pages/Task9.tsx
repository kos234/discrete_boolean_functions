import Limiter from "../components/Limiter";
import {ScrollView, useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, binSearch} from "../utils/utils";
import {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {checkVectorCorrect, getStringBooleanFormatByVector} from "../utils/boolsUtils";
import {fastClearArray} from "../utils/useArrayState";
import useErrorState from "../utils/useErrorState";

export default function Task9() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [rawVector, setRawVector] = useState<string>("");
    const [vectorError, isVectorError, setVectorError] = useErrorState(null, 0);


    function onVectorChange(value: string): void {
        const res = checkVectorCorrect(value);
        setVectorError(res.error);
        setRawVector(res.value.vector);
    }

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите f:  </ThemeText>
                <ThemeInput
                    style={{
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

            {!isVectorError.current ?

                <View style={[defaultStyle.marginTopNormal, {flexDirection: adaptiveLess(width, 1, {"478": 0}) ? "row" : "column"}]}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>СКНФ:&nbsp;</ThemeText>
                    <ScrollView horizontal={true}>
                        {getStringBooleanFormatByVector(rawVector, false, colorScheme)}
                    </ScrollView>
                </View>
                : null
            }
        </Limiter>
    )
}