import {useRef, useState} from "react";

export function fastClearArray<T>(array:T[]):void{
    array.splice(0,array.length);
}
export default function useArrayState<T>(initialState: T[]):[T[], ()=>void]{
    const [updateState, triggerUpdateState] = useState<boolean>(false);
    const refArray = useRef<T[]>(initialState);

    return [refArray.current, () => {
        triggerUpdateState(!updateState);
    }]
}