import Table, {TableColumn, TableRow} from "../components/Table";
import {forTo, getRandom, range} from "./utils";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import {FlatList} from "react-native";
import {calculateDefaultStyle} from "../globalStyles";
import {LightMode} from "../colors";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {TextStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";

type UtilsReturn<T> = {
    error: string | undefined,
    value: T
}

export function getRandomVector(argumentCount: number): UtilsReturn<string> {
    const res: UtilsReturn<string> = {error: null, value: ""};
    if (argumentCount > 10) {
        res.error = "Слишком большое значение n!";
        return res;
    }

    for (let i = 0; i < 1 << argumentCount; i++) {
        res.value += Math.floor(getRandom(0, 2));
    }

    return res;
}

export function checkVectorCorrect(rawVector: string): UtilsReturn<{ vector: string, argsCount: number }> {
    const res: UtilsReturn<{ vector: string, argsCount: number }> = {error: null, value: {vector: "", argsCount: 0}};
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

export function getResidualInVector(vector: string, residualIndexes: number[]) {
    let ans = "";
    for (let i = 0; i < residualIndexes.length; i++)
        ans += vector[residualIndexes[i]];
    return ans;
}

export function glueVectorOnResiduals(zeroResidual: string, oneResidual: string, zeroResidualIndexes: number[]): string {
    let ans = "";
    let zeroCount = 0;
    let oneCount = 0;
    for (let i = 0; i < zeroResidual.length * 2; i++) {
        if (i === zeroResidualIndexes[zeroCount])
            ans += zeroResidual[zeroCount++];
        else
            ans += oneResidual[oneCount++];
    }
    return ans;
}

export function getResidualIndexes(vectorLength: number, argument: number, residual: number): number[] {
    if (!vectorLength || !(argument > -1) || !(residual > -1))
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

export abstract class BooleanFormat {
    storage: {
        [key: string]: boolean
    } = {};

    abstract mainOperation(a:boolean, b:boolean):boolean;
    abstract innerOperation(a:boolean, b:boolean):boolean;
}

export class DNF extends BooleanFormat{
    innerOperation(a: boolean, b: boolean): boolean {
        return a || b;
    }

    mainOperation(a: boolean, b: boolean): boolean {
        return a && b;
    }

}

export class KNF extends BooleanFormat{
    innerOperation(a: boolean, b: boolean): boolean {
        return a && b;
    }

    mainOperation(a: boolean, b: boolean): boolean {
        return a || b;
    }

}

export function parseDNF(value: string): UtilsReturn<{ value: DNFValue[], maxPow: number }> {
    const res: UtilsReturn<{ value: DNFValue[], maxPow: number }> = {error: null, value: {value: [], maxPow: 0}};

    markerParse:{
        let currentDNF: DNFValue = {};
        let lastKey: number | null = null;
        let isTrue: boolean = true;
        let minusIgnoreCount: -1 | 0 | 1 = 0;
        const flush = () => {
            minusIgnoreCount--;
            if (lastKey != null)
                currentDNF[lastKey] = minusIgnoreCount === -1 ? isTrue : true
            if (minusIgnoreCount === -1) {
                minusIgnoreCount = 0;
                isTrue = true;
            }
            lastKey = null;
        }
        for (let i = 0; i < value.length; i++) {
            const currentChar = value[i];
            if (currentChar === "X" || currentChar === "x") {
                if (lastKey === 0) {
                    res.error = `Неверный символ на ${i + 1} позиции. Ожидается число, получено "x"`
                    break markerParse;
                }

                flush();
                lastKey = 0;
            } else if (currentChar >= "1" && currentChar <= "9") {
                if (lastKey == null) {
                    res.error = `Неверный символ на ${i + 1} позиции. Ожидается "x", получено число`
                    break markerParse;
                }
                lastKey = lastKey * 10 + parseInt(currentChar);
                res.value.maxPow = Math.max(lastKey, res.value.maxPow);
            } else if (currentChar === "V" || currentChar === "v") {
                console.log("vallue", value);
                if (lastKey == null) {
                    console.log("value", value);
                    res.error = `Перед знаком V на ${i + 1} позиции должна быть конъюнкция`
                    break markerParse;
                }

                if (lastKey === 0) {
                    res.error = `Перед знаком V на ${i + 1} находится переменная без номера`
                    break markerParse;
                }

                flush();
                res.value.value.push(currentDNF);
                currentDNF = {};
            } else if (currentChar === "-") {
                flush();
                if (!isTrue) {
                    res.error = `Неверный символ на ${i + 1} позиции. Ожидается "x", получено "-"`
                    break markerParse;
                }
                isTrue = false;
                minusIgnoreCount = 1;
            } else if (currentChar === " ") {

            } else {
                res.error = `Неверный символ на ${i + 1} позиции. Ожидается "x0-9V ", получено "${currentChar}"`
                break markerParse;
            }

            if (i + 1 === value.length && (lastKey != null || (lastKey == null && !isTrue))) {
                value += " V";
            }
        }
    }
    return res;
}

export function getValueINDNF(row: number, n: number, dnf: DNFValue[]): number {
    if (dnf.length === 0)
        return 0;

    let ans = false;

    for (let q = 0; q < dnf.length; q++) {
        let currentAns = true;
        let currentDNF = dnf[q];
        for (let i = 0; i < n; i++) {
            if (currentDNF[i + 1] == null)
                continue;

            currentAns &&= Math.floor((row / (1 << n - i - 1)) % 2) === +currentDNF[i + 1];
        }

        ans ||= currentAns;
    }

    return +ans;
}

export function drawTableBoolFunction(vector: string, defaultStyle: ReturnType<typeof calculateDefaultStyle>,
                                      colorScheme: typeof LightMode, addStyleToText?: (row: number, column: number) => StyleProp<TextStyle> | undefined,
                                      DNF?: DNFValue[]) {
    const n = Math.log2(vector.length);
    if (!addStyleToText)
        addStyleToText = (row, column) => {
            return undefined
        };
    return (
        <Table style={defaultStyle.marginTopSmall}>
            <TableRow style={{borderBottomWidth: 2, borderBottomColor: colorScheme.textColor}}>
                {forTo(n, (index) => (
                    <TableColumn key={"header" + index}>
                        <ThemeText fontSizeType={FontSizeTypes.small}
                                   style={[{textAlign: "center"}, addStyleToText(0, index)]}>x<ThemeText
                            fontSizeType={FontSizeTypes.sub}>{index + 1}</ThemeText></ThemeText>
                    </TableColumn>
                ))}
                <TableColumn
                    style={[{borderLeftWidth: 2, borderLeftColor: colorScheme.textColor}, addStyleToText(0, n)]}>
                    <ThemeText fontSizeType={FontSizeTypes.small} style={{textAlign: "center"}}>f</ThemeText>
                </TableColumn>

                {DNF ?
                    <TableColumn
                        style={[{
                            borderLeftWidth: 2,
                            borderLeftColor: colorScheme.textColor
                        }, addStyleToText(0, n), {width: 80}]}>
                        <ThemeText fontSizeType={FontSizeTypes.small} style={{textAlign: "center"}}>ДНФ</ThemeText>
                    </TableColumn> : null
                }
            </TableRow>

            <FlatList
                data={range(1 << n)}

                renderItem={({item}) => {
                    let dnfValue: number | null = DNF ? getValueINDNF(item, n, DNF) : null;

                    return (
                        <TableRow key={"row" + item}>
                            {forTo(n, (num) => (
                                <TableColumn key={"column" + item + "_" + num}>
                                    <ThemeText fontSizeType={FontSizeTypes.small}
                                               style={[{textAlign: "center"}, addStyleToText(item + 1, num)]}>{Math.floor((item / (1 << n - num - 1)) % 2)}</ThemeText>
                                </TableColumn>
                            ))}
                            <TableColumn style={{borderLeftWidth: 2, borderLeftColor: colorScheme.textColor}}>
                                <ThemeText fontSizeType={FontSizeTypes.small}
                                           style={[{textAlign: "center"}, addStyleToText(item + 1, n)]}>{vector ? vector[item] : ""}</ThemeText>
                            </TableColumn>

                            {DNF ?
                                <TableColumn
                                    style={[{
                                        borderLeftWidth: 2,
                                        borderLeftColor: colorScheme.textColor,
                                    }, addStyleToText(0, n), {width: 80}]}>
                                    <ThemeText fontSizeType={FontSizeTypes.small}
                                               colorType={vector[item] === dnfValue + "" ? ColorTypes.first : ColorTypes.error}
                                               style={{textAlign: "center"}}>{dnfValue}</ThemeText>
                                </TableColumn>
                                : null
                            }
                        </TableRow>
                    )
                }
                }
            >

            </FlatList>


        </Table>
    )
}