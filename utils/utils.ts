export function binSearch<T>(findValue:T, array:T[], comparator: (a:T, b:T)=>number):number|undefined{
    let start:number = 0;
    let end:number = array.length - 1;

    while (start <= end){
        const mid:number = Math.floor((start + end) / 2);
        const compRes = comparator(array[mid], findValue);
        if(compRes === 0) {
            return mid;
        }
        else if (compRes < 0)
            start = mid + 1;
        else
            end = mid - 1;

    }
    return undefined;
}

export function adaptiveLess(value:number, defaultStyle:number, adaptiveStyle: Object):number {
    let keys:number[] = Object.keys(adaptiveStyle).map(key => parseInt(key)).sort((a, b) => {
        return b - a
    });

    let start:number = 0;
    let end:number = keys.length - 1;

    while (start <= end) {
        const mid:number = Math.floor((start + end) / 2);
        if (keys[mid] === value) {
            return adaptiveStyle[keys[mid]];
        } else { // @ts-ignore
            if (keys[mid] > value) {
                start = mid + 1; // Ищем в правой половине
            } else {
                end = mid - 1; // Ищем в левой половине
            }
        }
    }
    if (start === 0)
        return defaultStyle;
    return adaptiveStyle[keys[start - 1]];
}

export function getRandom(start:number, end:number):number {
    return Math.random() * (end - start) + start;
}

export function forTo(value:number, callBack:(index:number) => any):any[] {
    let list = [];
    for (let i:number = 0; i < value; i++) {
        list.push(callBack(i));
    }

    return list;
}

export function range(value:number):number[] {
   return [...Array(value).keys()];
}

export function fastUniqueArray(array:number[]):void{
    for(let i = 1; i < array.length; i++){
        if(array[i - 1] === array[i]){
            array.splice(i, 1);
            i--;
        }
    }
}

export function safeToString(value:any):string{
    if(value == null)
        return "";
    return value + "";
}