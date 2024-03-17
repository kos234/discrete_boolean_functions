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