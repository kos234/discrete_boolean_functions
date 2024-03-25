import Limiter from "../components/Limiter";
import {useWindowDimensions, View} from "react-native";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {adaptiveLess} from "../utils/utils";
import {useContext, useRef, useState} from "react";
import {AppContext} from "../colors";
import {getRandomVector} from "../utils/boolsUtils";
import DropDown, {DropDownElement} from "../components/DropDown";
import useArrayState from "../utils/useArrayState";

export default function Task5() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [nValue, setNValue] = useState("");
    const [vector, setVector] = useState(null);
    const [error, setError] = useState(null);
    const [dataSignificant, commitDataSignificant] = useArrayState<{current: DropDownElement, all: DropDownElement[]}>()
    // const [dataSignificant, setDataSignificant] = useState<{current: DropDownElement, all: DropDownElement[]}[]>([]);


    function generateVector(value: string) {
        const res = getRandomVector(parseInt(value));
        setError(res.error);
        setVector(res.value);
        setNValue(value);
        setDataSignificant(Array(parseInt(value)).fill(true));
    }

    console.log("RERENDER BY TEST STATE");

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите n: </ThemeText>
                <ThemeInput style={{
                    marginLeft: 15,
                    flex: adaptiveLess(width, 0, {"478": 1}),
                    width: adaptiveLess(width, null, {"478": 2})
                }} value={nValue} onInput={generateVector} typeInput={"numeric"} placeholder={"число"}
                            fontSizeType={FontSizeTypes.normal}/>
            </View>
            <ThemeText>{testState.length}</ThemeText>
            {error ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{error}</ThemeText>
            </View> : null}

            {/*{vector && nValue ? <>*/}
            {/*    <View style={defaultStyle.marginTopNormal}>*/}
            {/*        <ThemeText fontSizeType={FontSizeTypes.normal}>f = ({vector})</ThemeText>*/}
            {/*    </View>*/}

            {/*    <View>*/}
            {/*        {dataSignificant.map((item, index) => (*/}
            {/*            <View key={index} style={defaultStyle.marginTopNormal}>*/}
            {/*                <ThemeText fontSizeType={FontSizeTypes.normal}>x<ThemeText fontSizeType={FontSizeTypes.sub}>{index}</ThemeText></ThemeText>*/}
            {/*                <DropDown elements={item.all} defaultValue={item.current} placeholder={"тип"} onSelect={(itm) => {*/}

            {/*                }}/>*/}
            {/*            </View>*/}
            {/*        ))}*/}
            {/*    </View>*/}
            {/*</> : null}*/}
        </Limiter>
    )
}

/*

    bench test

    1 spread vs push

139,273
±0.83%
fastest
    const arr = [];
    for(let i = 0; i < 1000; i++){
        arr.push(i);
    }

65.82
±1.17%
100% slower
    let arr = [];
    for(let i = 0; i < 1000; i++){
        arr = [...arr, i];
    }


 */