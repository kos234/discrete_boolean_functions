import Table, {TableColumn, TableRow} from "../components/Table";
import {fastParse0or1, forTo, GetArrayReturnType, getRandom, range} from "./utils";
import ThemeText, {ColorTypes, FontSizeTypes} from "../components/ThemeText";
import {FlatList} from "react-native";
import {calculateDefaultStyle} from "../globalStyles";
import {LightMode} from "../colors";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {TextStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import {ReactNode} from "react";
import {fastClearArray} from "./useArrayState";

export type UtilsReturn<T> = {
    error: string | undefined,
    value: T
}

//Это 1 задание, получение случайного вектора
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

//Это проверка пользовательского ввода вектора
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

//Это функция для 2 задания, на вход вектора и индексы остаточной, на выходе она отдаёт остаточную
export function getResidualInVector(vector: string, residualIndexes: number[]) {
    let ans = "";
    for (let i = 0; i < residualIndexes.length; i++)
        ans += vector[residualIndexes[i]];
    return ans;
}

//Это функция для 3 задания, на вход нулевая остаточная, единичная остаточная и индексы нулевой остаточной, на выходе склеенная из двух остаточных функция
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

//Это функция для нахождения остаточной от функции по аргументу
export function getResidualIndexes(vectorLength: number, argument: number, residual: number): number[] {
    if (!vectorLength || !(argument > -1) || !(residual > -1)) //проверка пользовательского ввода
        return [];

    /*
    Я представляю вектор как куски нулевых или единичных остаточных, количество кусков это 2^n
    т.е. для остаточной по первому аргументу будет 2 куска - 00|11, для второго аргумента будет 4 куса - 0|0|1|1 и тд
    Длина 1 куска это длина вектора / куски
    */
    const chunkCount = 1 << argument;
    const chunkLength = Math.floor(vectorLength / chunkCount);

    let ans = [];
    for (let chunk = 0; chunk < chunkCount; chunk += 2) { //идём через кусок, т.к. нас интересует либо 0 либо 1 куски
        for (let index = 0; index < chunkLength; index++) {
            ans.push((chunk + residual) * chunkLength + index); //Индекс элемента в остаточной это (чанк + (0 или 1)) * длина + 1, (0 или 1) - это 0 либо 1 остаточная
        }
    }

    return ans;
}

export abstract class BooleanFormat { //Это класс оболочка для ДНФ и КНФ
    //Сколько переменных в ДНФ
    private maxPow: number = 0;

    //ДНФ представляю как массив объектов, в объекте ключ это индекс переменной, а значение показывает отсутствие отрицания над переменной
    //Например, [{1: true, 2:false}, {3:true}] это X1-X2 V x3
    public storage: {
        [key: string]: boolean
    }[] = [];

    public getMaxPow(): number {
        return this.maxPow;
    }

    public calculateMaxPow(currentPow: number): void {
        this.maxPow = Math.max(currentPow, this.maxPow);
    }

    public abstract mainOperation(a: boolean, b: boolean): boolean;

    public abstract innerOperation(a: boolean, b: boolean): boolean;

    public abstract getMainDefault(): boolean;

    public abstract getInnerDefault(): boolean;
}

export class DNF extends BooleanFormat {//Реализация ДНФ
    public innerOperation(a: boolean, b: boolean): boolean {
        return a && b;
    }

    public mainOperation(a: boolean, b: boolean): boolean {
        return a || b;
    }

    public getInnerDefault(): boolean {
        return true;
    }

    public getMainDefault(): boolean {
        return false;
    }
}

export class KNF extends BooleanFormat {//Реализация КНФ
    public innerOperation(a: boolean, b: boolean): boolean {
        return a || b;
    }

    public mainOperation(a: boolean, b: boolean): boolean {
        return a && b;
    }

    public getInnerDefault(): boolean {
        return false;
    }

    public getMainDefault(): boolean {
        return true;
    }
}

//Это функция парсинга для 6 и 7 задания
//На вход принимает вектор и то что мы парсим: днф или кнф
export function parseDNF(value: string, isDNF: boolean): UtilsReturn<BooleanFormat> {
    const res: UtilsReturn<BooleanFormat> = {error: null, value: isDNF ? new DNF() : new KNF()};

    markerParse:{
        //Текущее хранилище, то что находится между V и ^ в ДНФ и КНФ
        let currentBooleanFormatElement: (GetArrayReturnType<BooleanFormat["storage"], {}>) = {};
        let lastKey: number | null = null; //Это переменная для последовательного сбора индекса переменной
        let isTrue: boolean = true; //Если ли отрицание
        Поскольку парсинг идёт последовательно,
        // let minusIgnoreCount: -1 | 0 | 1 = 0;
        const flush = () => {
            minusIgnoreCount--;
            if (lastKey != null)
                currentBooleanFormatElement[lastKey] = minusIgnoreCount === -1 ? isTrue : true
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
                res.value.calculateMaxPow(lastKey);
            } else if ((isDNF && (currentChar === "V" || currentChar === "v") || (!isDNF && currentChar == "^"))) {
                if (lastKey == null) {
                    res.error = `Перед знаком ${isDNF ? "V" : "^"} на ${i + 1} позиции должна быть ${isDNF ? "конъюнкция" : "дизъюнкция"}`
                    break markerParse;
                }

                if (lastKey === 0) {
                    res.error = `Перед знаком ${isDNF ? "V" : "^"} на ${i + 1} находится переменная без номера`
                    break markerParse;
                }

                flush();
                res.value.storage.push(currentBooleanFormatElement);
                currentBooleanFormatElement = {};
            } else if (currentChar === "-") {
                flush();
                if (!isTrue) {
                    res.error = `Неверный символ на ${i + 1} позиции. Ожидается "x", получено "-"`
                    break markerParse;
                }
                isTrue = false;
                minusIgnoreCount = 1;
            } else if (currentChar === " " || currentChar === "(" || currentChar === ")" || (!isDNF && (currentChar === "V" || currentChar === "v"))) {
                //ignore
            } else {
                res.error = `Неверный символ на ${i + 1} позиции. Ожидается "x0-9V ", получено "${currentChar}"`
                break markerParse;
            }

            if (i + 1 === value.length && (lastKey != null || (lastKey == null && !isTrue))) {
                value += " " + (isDNF ? "V" : "^");
            }
        }
    }
    return res;
}

export function getValueINDNF(row: number, n: number, booleanFormat: BooleanFormat): number {
    if (booleanFormat.storage.length === 0)
        return 0;

    let ans = booleanFormat.getMainDefault();
    for (let q = 0; q < booleanFormat.storage.length; q++) {
        let currentAns = booleanFormat.getInnerDefault();
        let currentDNF = booleanFormat.storage[q];
        for (let i = 0; i < n; i++) {
            if (currentDNF[i + 1] == null)
                continue;
            currentAns = booleanFormat.innerOperation(currentAns, Math.floor((row / (1 << n - i - 1)) % 2) === +currentDNF[i + 1])
        }

        ans = booleanFormat.mainOperation(ans, currentAns)
    }

    return +ans;
}

export function getStringBooleanFormatByVector(vector: string, isDNF: boolean, colorScheme: typeof LightMode) {
    const fontSize = FontSizeTypes.normal;
    const ans: ReactNode[] = []
    const n = Math.log2(vector.length);
    for (let row = 0; row < vector.length; row++) {
        if (vector[row] === "1") {
            if (!isDNF)
                continue;
        } else {
            if (isDNF)
                continue;

            ans.push(<ThemeText fontSizeType={fontSize}>(</ThemeText>);
        }

        for (let i = 0; i < n; i++) {
            // ans.push(<ThemeText>{Math.floor((row / (1 << n - i - 1)) % 2) !== +isDNF ? "-" : ""}</ThemeText>)
            //@ts-ignore
            ans.push(
                <ThemeText fontSizeType={fontSize} style={{position: "relative"}}>x
                    {Math.floor((row / (1 << n - i - 1)) % 2) !== +isDNF ?
                        <ThemeText fontSizeType={fontSize} style={{
                            position: "absolute",
                            backgroundColor: colorScheme.textColor,
                            left: 3,
                            right: 3,
                            top: 10,
                            height: 2
                        }}>&nbsp;</ThemeText>
                        : null}
                    <ThemeText fontSizeType={FontSizeTypes.sub}>{(i + 1)}</ThemeText>
                </ThemeText>
            )
            if (i + 1 !== n && !isDNF) {
                ans.push(<ThemeText fontSizeType={fontSize}>V</ThemeText>)
            }

            // localAns.push(((Math.floor((row / (1 << n - i - 1)) % 2) !== +isDNF) ? "-" : "") + "x" + <ThemeText fontSizeType={FontSizeTypes.sub}>{(i + 1)}</ThemeText>);
        }

        if (isDNF) {
            ans.push(<ThemeText fontSizeType={fontSize}> V </ThemeText>);
        } else {
            ans.push(<ThemeText fontSizeType={fontSize}>)</ThemeText>);
            //@ts-ignore
            ans.push(<ThemeText fontSizeType={fontSize} style={{transform: [{rotate: 180}]}}> V </ThemeText>);
        }
    }

    ans.splice(ans.length - 1, 1);
    return ans;
}

export class ArgumentIndex {
    public static parseString(matrix: string): number[] {
        return matrix.split("").map(fastParse0or1)
    }

    public static equal(first: number[], second: number[]): boolean {
        if (first.length != second.length)
            return false;

        let isEqual = true;
        for (let i = 0; i < first.length && isEqual; i++) {
            if (first[i] === 9 || second[i] === 9)
                continue;

            isEqual &&= first[i] === second[i];
        }

        return isEqual;
    }

    public static toMatrixIndex(index: number, n: number): number[] {
        const ans: number[] = Array(n).fill(0);

        for (let write = n - 1; index !== 0; write--) {
            ans[write] = index & 1;
            index >>= 1;
        }

        return ans;
    }

    public static toNumberIndex(indexes: number[]): number {
        let ans: number = 0;
        for (let i = 0; i < indexes.length; i++) {
            ans = (ans << 1) | indexes[i]
        }

        return ans;
    }

    public static getBigNeighbors(indexes: number[]): { differentIndex: number, value: number[] }[] {
        let ans: { differentIndex: number, value: number[] }[] = [];
        for (let i = 0; i < indexes.length; i++) {
            if (indexes[i] !== 0)
                continue;
            ans.push(
                {
                    differentIndex: i,
                    value: [
                        ...indexes.slice(0, i),
                        1,
                        ...indexes.slice(i + 1, indexes.length)
                    ]
                }
            )
        }

        return ans;
    }
}

export function checkPreFullClases(vector: string): { t0: boolean, t1: boolean, s: boolean, l: boolean, m: boolean } {
    const res = {t0: true, t1: true, s: true, l: true, m: true};
    const n = Math.log2(vector.length);
    res.t0 = vector[0] === "0";
    res.t1 = vector[vector.length - 1] === "1";

    // checkS
    for (let i = 0; i < vector.length / 2; i++) {
        if (vector[i] === vector[vector.length - 1 - i]) {
            res.s = false;
            break;// checkS;
        }
    }
    // end

    // checkM
    for (let i = 0; i < vector.length; i++) {
        const checkMatrix = ArgumentIndex.getBigNeighbors(ArgumentIndex.toMatrixIndex(i, n));

        for (let q = 0; q < checkMatrix.length; q++) {
            if (fastParse0or1(vector[i]) > fastParse0or1(vector[ArgumentIndex.toNumberIndex(checkMatrix[q].value)])) {
                res.m = false;
                break;// checkM;
            }
        }
    }
    // end

    // checkL
    const arrLinear: number[][] = [];

    for (let i = 0; i < vector.length; i++) {
        arrLinear.push([])
        for (let q = 0; q < vector.length - i; q++) {
            if (i === 0) {
                arrLinear[i].push(fastParse0or1(vector[q]));
            } else {
                arrLinear[i].push(+(arrLinear[i - 1][q] !== arrLinear[i - 1][q + 1]));
            }
        }
    }

    for (let i = 0; i < vector.length; i++) {
        if (arrLinear[i][0] === 1 && !Number.isInteger(Math.log2(i))) {
            res.l = false;
            break;// checkL;
        }
    }
    // end


    return res;
}

export function getMinDNFByMaxClass(vector: string, colorScheme: typeof LightMode): UtilsReturn<ReactNode[]> {
    const res: UtilsReturn<ReactNode[]> = {error: null, value: []};
    const n = Math.log2(vector.length);

    markerCalc:{
        const mapOnes: Map<number, string[]> = new Map<number, string[]>(); //карта конечных масок
        let dataUsageMasks: Map<string, number> = new Map<string, number>(); //карта использований масок
        for (let i = 0; i < vector.length; i++) {//запоминаем все 1
            if (vector[i] === "1") {
                dataUsageMasks.set(ArgumentIndex.toMatrixIndex(i, n).join(""), 0)
                mapOnes.set(i, []);
            }
        }

        if (dataUsageMasks.size === 0) {
            res.error = "Функция никогда не равна 1, невозможно построить ДНФ!";
            break markerCalc;
        }

        while (true) { //склеиваем все маски
            const localSet: Set<string> = new Set<string>(Array.from(dataUsageMasks.keys()));
            for (let [value] of dataUsageMasks) {
                ArgumentIndex.getBigNeighbors(ArgumentIndex.parseString(value)).forEach(wrapper => {
                    if (dataUsageMasks.has(wrapper.value.join(""))) {
                        localSet.add([
                            ...wrapper.value.slice(0, wrapper.differentIndex),
                            9,
                            ...wrapper.value.slice(wrapper.differentIndex + 1, wrapper.value.length)
                        ].join(""));

                        localSet.delete(value); //удаляем из сета то из чего склеивали
                        localSet.delete(wrapper.value.join(""));
                    }
                });
            }
            if (localSet.size !== dataUsageMasks.size)
                dataUsageMasks = new Map<string, number>(Array.from(localSet, (item) => [item, 0]));
            else
                break;
        }

        for (let [keyAns] of mapOnes) { //подсчитываем использование каждой маски
            for (let [value] of dataUsageMasks) {
                if (ArgumentIndex.equal(ArgumentIndex.toMatrixIndex(keyAns, n), ArgumentIndex.parseString(value))) {
                    mapOnes.get(keyAns).push(value);
                    dataUsageMasks.set(value, dataUsageMasks.get(value) + 1)
                }
            }
        }

        let ansArray: string[] = []; //массив днф масок
        while (mapOnes.size != 0) {//просеиваем днф маски и выбираем минимально необходимые=
            //Находим маски с максимальным использованием среди столбца с наименьшим числом масок
            let maxUsage = Number.MIN_SAFE_INTEGER;
            let maxUsageKey: string[] = [];
            for (let [maksValue, maskUsage] of dataUsageMasks) {
                if (maxUsage < maskUsage) {
                    maxUsage = maskUsage;
                    fastClearArray(maxUsageKey);
                    maxUsageKey.push(maksValue);
                } else if (maxUsage === maskUsage)
                    maxUsageKey.push(maksValue);
            }
            //-----------------------------------------------------------------------------------

            //Выбираем маску, которую добавим в днф
            let deleteMask = maxUsageKey[0]; //По умолчанию первая маска из максимальных
            for (let i = 0; i < maxUsageKey.length - 1; i++) {//Находим маску, которая имеет 0 пересечений с другими, в противном случае без разницы какую маску использовать
                let equalValue = 0;
                for (let q = i + 1; q < maxUsageKey.length; q++) {
                    for (let [keyOne, valueOne] of mapOnes) {
                        if (valueOne.filter(item => item === maxUsageKey[i] || item === maxUsageKey[q]).length === 2) { //фильтруем маски
                            equalValue++;
                        }
                    }
                }

                if (equalValue === 0) {
                    deleteMask = maxUsageKey[i];
                    break;
                }
            }
            //-------------------------------------

            ansArray.push(deleteMask); //Добавляем днф
            for (let [keyOne, valueOne] of mapOnes) {
                const indexDeleteMask = valueOne.indexOf(deleteMask);
                // console.log("find", masksForDelete, "index", indexDeleteMask);
                if (indexDeleteMask === -1)
                    continue

                for (let i = 0; i < valueOne.length + 1; i++) {
                    const deleteUsageKey = i === 0 ? deleteMask : valueOne[i - 1];
                    const tmpUsage = dataUsageMasks.get(deleteUsageKey);
                    if (tmpUsage === 1)
                        dataUsageMasks.delete(deleteUsageKey)
                    else
                        dataUsageMasks.set(deleteUsageKey, tmpUsage - 1);
                }
                mapOnes.delete(keyOne)
            }
        }

        for (let i = 0; i < ansArray.length; i++) {
            const currentMask = ansArray[i];

            for (let q = 0; q < currentMask.length; q++) {
                if (currentMask[q] === "9")
                    continue;

                res.value.push(
                    <ThemeText key={"x" + i + "" + q} fontSizeType={FontSizeTypes.normal}
                               style={{position: "relative"}}>x
                        {currentMask[q] === "0" ?
                            <ThemeText fontSizeType={FontSizeTypes.normal} style={{
                                position: "absolute",
                                backgroundColor: colorScheme.textColor,
                                left: 3,
                                right: 3,
                                top: 10,
                                height: 2
                            }}>&nbsp;</ThemeText>
                            : null}
                        <ThemeText fontSizeType={FontSizeTypes.sub}>{(q + 1)}</ThemeText>
                    </ThemeText>
                )
            }
            if (i + 1 != ansArray.length)
                res.value.push(<ThemeText key={"v" + i} fontSizeType={FontSizeTypes.normal}> V </ThemeText>)
        }
    }

    return res;
}

export function drawTableBoolFunction(vector: string, defaultStyle: ReturnType<typeof calculateDefaultStyle>,
                                      colorScheme: typeof LightMode, addStyleToText?: (row: number, column: number) => StyleProp<TextStyle> | undefined,
                                      booleanFormat?: BooleanFormat) {
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

                {booleanFormat ?
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
                    let booleanFormatValue: number | null = booleanFormat ? getValueINDNF(item, n, booleanFormat) : null;

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

                            {booleanFormat ?
                                <TableColumn
                                    style={[{
                                        borderLeftWidth: 2,
                                        borderLeftColor: colorScheme.textColor,
                                    }, addStyleToText(0, n), {width: 80}]}>
                                    <ThemeText fontSizeType={FontSizeTypes.small}
                                               colorType={vector[item] === booleanFormatValue + "" ? ColorTypes.first : ColorTypes.error}
                                               style={{textAlign: "center"}}>{booleanFormatValue}</ThemeText>
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