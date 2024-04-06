import Limiter from "../components/Limiter";
import {useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess, binSearch} from "../utils/utils";
import {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {checkVectorCorrect, getStringBooleanFormatByVector} from "../utils/boolsUtils";
import {fastClearArray} from "../utils/useArrayState";

export default function Task9() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [rawVector, setRawVector] = useState<string>("");
    const [errorVector, setErrorVector] = useState(null);

    function onVectorChange(value: string): void {
        const res = checkVectorCorrect(value);
        setErrorVector(res.error);
        setRawVector(res.value.vector);
    }

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

            {!errorVector ?

                <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", alignItems: "flex-end"}]}>
                    <ThemeText fontSizeType={FontSizeTypes.normal}>СКНФ:&nbsp;</ThemeText>
                    {getStringBooleanFormatByVector(rawVector, false, colorScheme)}
                </View>
                : null
            }
        </Limiter>
    )
}