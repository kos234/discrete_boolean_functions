import {FlatList, StyleSheet, useWindowDimensions, View} from "react-native";
import Limiter from "../components/Limiter";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import ThemeInput from "../components/ThemeInput";
import {useContext, useRef, useState} from "react";
import {adaptiveLess, forTo, getRandom, range} from "../utils";
import {ThemeContext} from "../colors";
import Table, {TableColumn, TableRow} from "../components/Table";

export default function Task1() {
    const {height, width} = useWindowDimensions();
    const [nValue, setNValue] = useState("");
    const refN = useRef(0);
    const [vector, setVector] = useState(null);
    const {colorScheme, defaultStyle} = useContext(ThemeContext);
    const [error, setError] = useState(null);

    const generateVector = (value: string) => {
        let tmp: number = parseInt(value);
        if (tmp > 10) {
            setError("Слишком большое значение n!");
        } else {
            setError(null);
            refN.current = tmp;
            let vectorTmp: string = "";
            for (let i = 0; i < Math.pow(2, refN.current); i++) {
                vectorTmp += Math.floor(getRandom(0, 2));
            }

            setVector(vectorTmp);
        }

        setNValue(value);
    }

    const styles = StyleSheet.create({});

    return (
        <Limiter>
            <View style={{flexDirection: "row"}}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>Введите n: </ThemeText>
                <ThemeInput style={{marginLeft: 15, flex: adaptiveLess(width, 0, {"478": 1}), width: adaptiveLess(width, null, {"478": 2})}} value={nValue} onInput={generateVector} typeInput={"numeric"} placeholder={"число"}
                            fontSizeType={FontSizeTypes.normal}/>
            </View>

            {error ? <View style={defaultStyle.marginTopSmall}>
                <ThemeText colorType={ColorTypes.error}
                           fontSizeType={FontSizeTypes.error}>{error}</ThemeText>
            </View> : null}

            <View style={defaultStyle.marginTopNormal}>
                <ThemeText fontSizeType={FontSizeTypes.normal}>f(n) = {vector}</ThemeText>
            </View>

            {vector ?
                <Table style={defaultStyle.marginTopSmall}>
                    <TableRow style={{borderBottomWidth: 2, borderBottomColor: colorScheme.textColor}}>
                        {forTo(refN.current, (index) => (
                            <TableColumn key={"header" + index}>
                                <ThemeText fontSizeType={FontSizeTypes.small} style={{textAlign: "center"}}>x<ThemeText fontSizeType={FontSizeTypes.sub}>{index + 1}</ThemeText></ThemeText>
                            </TableColumn>
                        ))}
                        <TableColumn style={{borderLeftWidth: 2, borderLeftColor: colorScheme.textColor}}>
                            <ThemeText fontSizeType={FontSizeTypes.small} style={{textAlign: "center"}}>f</ThemeText>
                        </TableColumn>
                    </TableRow>

                    <FlatList
                    data={range(Math.pow(2, refN.current))}

                    renderItem={({item}) => (
                        <TableRow key={"row" + item}>
                            {forTo(refN.current, (num) => (
                                <TableColumn key={"column" + item + "_" + num}>
                                    <ThemeText fontSizeType={FontSizeTypes.small} style={{textAlign: "center"}}>{Math.floor((item / Math.pow(2, refN.current - num - 1)) % 2)}</ThemeText>
                                </TableColumn>
                            ))}
                            <TableColumn style={{borderLeftWidth: 2,borderLeftColor: colorScheme.textColor}}>
                                <ThemeText fontSizeType={FontSizeTypes.small} style={{textAlign: "center"}}>{vector ? vector[item] : ""}</ThemeText>
                            </TableColumn>
                        </TableRow>
                    )}
                    >

                    </FlatList>



                </Table> : null}
        </Limiter>
    );
}