import {FlatList, ScrollView, StyleSheet, Text, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {useContext, useRef, useState} from "react";
import {adaptiveLess, forTo, getRandom, range, safeToString} from "../utils/utils";
import {AppContext} from "../colors";
import Table, {TableColumn, TableRow} from "../components/Table";
import {drawTableBoolFunction, getRandomVector} from "../utils/boolsUtils";
import HomePage from "./HomePage";

export default function Task1() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState<number>(null);
    const [vector, setVector] = useState(null);
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [error, setError] = useState(null);

    function generateVector(value: string){
        const n = parseInt(value);
        const res = getRandomVector(n);
        setError(res.error);
        setVector(res.value);
        setNValue(n);
    }

    return (
        <Limiter notScroll={true} styleMain={{height: height - defaultStyle.fontSize_title.headerHeight}}>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите n:  </ThemeText>
                <ThemeInput style={{flex: adaptiveLess(width, 0, {"478": 1}), width: adaptiveLess(width, null, {"478": 2})}}
                            value={safeToString(nValue)} onInput={generateVector} typeInput={"numeric"} placeholder={"число"}
                            fontSizeType={FontSizeTypes.normal}/>
            </View>

            {error ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{error}</ThemeText>
            </View> : null}

            {vector && nValue ? <View style={[defaultStyle.marginTopNormal, {flexDirection: "row"}]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>f = </ThemeText>
                <ScrollView horizontal={true}>
                    <ThemeText>({vector})</ThemeText>
                </ScrollView>
            </View> : null}

            {vector && nValue ? drawTableBoolFunction(vector, defaultStyle, colorScheme) : null}

        </Limiter>
    );
}