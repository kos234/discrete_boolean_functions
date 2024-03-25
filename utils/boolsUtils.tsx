import Table, {TableColumn, TableRow} from "../components/Table";
import {binSearch, forTo, getRandom, range} from "./utils";
import ThemeText, {FontSizeTypes} from "../components/ThemeText";
import {FlatList} from "react-native";
import {calculateDefaultStyle} from "../globalStyles";
import {LightMode} from "../colors";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {TextStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import {retrySymbolicateLogNow} from "@expo/metro-runtime/build/error-overlay/Data/LogBoxData";

type UtilsReturn<T> = {
    error: string|undefined,
    value: T
}
export function getRandomVector(argumentCount: number): UtilsReturn<string> {
    const res:UtilsReturn<string> = {error: null, value: ""};
    if (argumentCount > 10) {
        res.error = "Слишком большое значение n!";
        return res;
    }

    for (let i = 0; i < 1 << argumentCount; i++) {
        res.value += Math.floor(getRandom(0, 2));
    }

    return res;
}

export function checkVectorCorrect(rawVector:string):UtilsReturn<{vector: string, argsCount: number}>{
    const res:UtilsReturn<{vector: string, argsCount: number}> = {error: null, value: {vector: "", argsCount: 0}};
    res.value.vector = rawVector.replaceAll(/[^01]/g, "");

    vectorManipulation: {
        if (rawVector.length === 0)
            break vectorManipulation;

        res.value.argsCount = Math.log2(rawVector.length);
        if (res.value.argsCount == 0 || res.value.argsCount % 1 !== 0) {
            const lower = 1 << Math.floor(res.value.argsCount);
            if (res.value.argsCount == 0)
                res.error = "Длина вектора должна быть больше 1";
            else
                res.error = "Возможная длина вектора: " + lower + " или " + (lower * 2);
            break vectorManipulation;
        }

    }
    return res;
}

export function getResidualInVector(vector: string, residualIndexes:number[]) {
    let ans = "";
    for(let i = 0; i < residualIndexes.length; i++)
        ans += vector[residualIndexes[i]];
    return ans;
}

export function glueVectorOnResiduals(zeroResidual:string, oneResidual:string, residualIndexes:number[]):string{
    let ans = "";
    let zeroCount = 0;
    let oneCount = 0;
    for(let i = 0; i < zeroResidual.length * 2; i++){
        ans += binSearch<number>(i, residualIndexes, (a, b) => a - b) != undefined ? zeroResidual[zeroCount++] : oneResidual[oneCount++]
    }
    return ans;
}

export function getResidualIndexes(vectorLength:number, argument: number, residual: number):number[] {
    if(!vectorLength || !(argument > -1) || !(residual > -1))
        return [];

    const chunkCount = 1 << argument;
    const chunkLength = Math.floor(vectorLength / chunkCount);

    let ans = [];
    for (let chunk = 0; chunk < chunkCount; chunk += 2) {
        for (let index = 0; index < chunkLength; index++) {
            ans.push((chunk + residual) * chunkLength + index);
        }
    }

    return ans;
}

export function drawTableBoolFunction(vector: string, defaultStyle: ReturnType<typeof calculateDefaultStyle>, colorScheme: typeof LightMode, addStyleToText?:(row:number, column:number)=>StyleProp<TextStyle>|undefined) {
    const n = Math.log2(vector.length);
    if(!addStyleToText)
        addStyleToText = (row, column) => {return undefined};
    return (
        <Table style={defaultStyle.marginTopSmall}>
            <TableRow style={{borderBottomWidth: 2, borderBottomColor: colorScheme.textColor}}>
                {forTo(n, (index) => (
                    <TableColumn key={"header" + index}>
                        <ThemeText fontSizeType={FontSizeTypes.small} style={[{textAlign: "center"}, addStyleToText(0, index)]}>x<ThemeText
                            fontSizeType={FontSizeTypes.sub}>{index + 1}</ThemeText></ThemeText>
                    </TableColumn>
                ))}
                <TableColumn style={[{borderLeftWidth: 2, borderLeftColor: colorScheme.textColor}, addStyleToText(0, n)]}>
                    <ThemeText fontSizeType={FontSizeTypes.small} style={{textAlign: "center"}}>f</ThemeText>
                </TableColumn>
            </TableRow>

            <FlatList
                data={range(1 << n)}

                renderItem={({item}) => (
                    <TableRow key={"row" + item}>
                        {forTo(n, (num) => (
                            <TableColumn key={"column" + item + "_" + num}>
                                <ThemeText fontSizeType={FontSizeTypes.small}
                                           style={[{textAlign: "center"},  addStyleToText(item + 1, num)]}>{Math.floor((item / (1 << n - num - 1)) % 2)}</ThemeText>
                            </TableColumn>
                        ))}
                        <TableColumn style={{borderLeftWidth: 2, borderLeftColor: colorScheme.textColor}}>
                            <ThemeText fontSizeType={FontSizeTypes.small}
                                       style={[{textAlign: "center"}, addStyleToText(item + 1, n)]}>{vector ? vector[item] : ""}</ThemeText>
                        </TableColumn>
                    </TableRow>
                )}
            >

            </FlatList>


        </Table>
    )
}