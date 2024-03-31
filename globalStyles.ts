import {StyleProp, StyleSheet, TextStyle, ViewStyle} from "react-native";
import {adaptiveLess} from "./utils/utils";
import {FontSizeTypes} from "./components/ThemeText";
import {ViewProps} from "react-native/Libraries/Components/View/ViewPropTypes";

export interface DefaultProps{
    style?:StyleProp<ViewStyle> | StyleProp<TextStyle>,
    children?:any,
}
export function calculateDefaultStyle(width:number){
    return StyleSheet.create({
        //Margins
        marginTopNormal:{
            marginTop: adaptiveLess(width, 25, {"1270": 15, "1048": 15, "700": 15})
        },
        marginTopSmall:{
            marginTop: adaptiveLess(width, 10, {"1270": 7, "1048": 7, "700": 7})
        },
        //Размер текста
        fontSize_big:{
            fontSize: adaptiveLess(width, 40, {"1270": 35, "425": 32})
        },
        fontSize_buttonCard:{
            fontSize: adaptiveLess(width, 20, {})
        },
        fontSize_normal:{
            fontSize: adaptiveLess(width, 30, {"1270": 25, "425": 22})
        },
        fontSize_small:{
            fontSize: adaptiveLess(width, 25, {"1270": 23, "425": 21})
        },
        fontSize_error:{
            fontSize: adaptiveLess(width, 20, {"1270": 17, "425": 16})
        },
        fontSize_sub:{
            fontSize: adaptiveLess(width, 14, {"1270": 12, "425": 11})
        },
        fontSize_title:{
            fontSize: adaptiveLess(width, 18, {"425": 16}),
            //@ts-ignore
            themeIconSize: adaptiveLess(width, 30, {"425": 21}),
            //@ts-ignore
            backIconSize: adaptiveLess(width, 25, {"425": 21}),
            //@ts-ignore
            headerHeight: adaptiveLess(width, 63, {"425": 54}),
        },
    });
}