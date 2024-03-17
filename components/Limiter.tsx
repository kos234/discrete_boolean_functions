import {View, StyleSheet, ScrollView, useWindowDimensions} from "react-native";
import {adaptiveLess} from "../utils";
import {DefaultProps} from "../globalStyles";
import ThemeText from "./ThemeText";
export default function Limiter({children, style}:DefaultProps){
    const {height, width} = useWindowDimensions();

    const styles = StyleSheet.create({
        wrapperContainer: {
            justifyContent: "center",
            flexDirection: "row",
            paddingTop: adaptiveLess(width, 40, {"700": 20}),
            paddingBottom: adaptiveLess(width, 40, {"700": 20}),
        },
        mainContainer: {
            width: width * adaptiveLess(width, 0.55, {"1270": 0.7, "1048": 0.8, "700": 0.9}),
        }
    });

    return (
        <ScrollView>
            <View style={styles.wrapperContainer}>
                <View style={[styles.mainContainer, style]}>
                    {children}
                </View>
            </View>
        </ScrollView>
    );
}