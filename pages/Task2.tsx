import {Text, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import DropDown, {DropDownElement} from "../components/DropDown";
import {useContext, useRef, useState} from "react";
import {adaptiveLess} from "../utils";
import {AppContext} from "../colors";

export default function Task2() {
    const {height, width} = useWindowDimensions();
    const {colorScheme, defaultStyle} = useContext(AppContext);
    const [rawVector, setRawVector] = useState("");
    const [rawResidual, setRawResidual] = useState("");
    const [rawArgument, setRawArgument] = useState("");
    const [errorVector, setErrorVector] = useState(null);
    const refArguments = useRef([]);
    const refResiduals = useRef([{key: "0", value: "0"}, {key: "1", value: "1"}]);

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

                refArguments.current = [];
                for (let i = 0; i < argsCount; i++) {
                    refArguments.current.push({
                        key: "" + i,
                        value: (<>
                            x<ThemeText fontSizeType={FontSizeTypes.sub}>{i + 1}</ThemeText>
                        </>)
                    })
                }
            }
        }

        setRawVector(value);
    }

    function selectArgument(item:DropDownElement):void{
        setRawArgument(item.key);
    }

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите f(n): </ThemeText>
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

            <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 3}]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Выберите аргумент: </ThemeText>
                <DropDown elements={refArguments.current} onSelect={selectArgument} defaultValue={rawArgument} placeholder={"аргумент"}></DropDown>
            </View>

            <View style={[defaultStyle.marginTopNormal, {flexDirection: "row", zIndex: 2}]}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Выберите остаточную: </ThemeText>
                <DropDown elements={refResiduals.current} onSelect={selectArgument} defaultValue={rawResidual} placeholder={"остаточная"}></DropDown>
            </View>

            <View style={defaultStyle.marginTopNormal}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>f<View><ThemeText fontSizeType={FontSizeTypes.sub}>0</ThemeText><ThemeText fontSizeType={FontSizeTypes.sub}>x1</ThemeText></View>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate dolorem ducimus eius ipsum iste natus non numquam quo similique suscipit.</ThemeText>
            </View>

            <View style={{flexDirection: "row", marginTop: height}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите f(n): </ThemeText>
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
        </Limiter>
    );
}