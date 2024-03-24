import {Platform, Text, View} from "react-native";
import Limiter from "../components/Limiter";
import {useContext} from "react";
import {AppContext} from "../colors";


export default function Task3() {
    const {colorScheme, defaultStyle} = useContext(AppContext);

    return (
        <Limiter>
            {/*<View style={{position: "absolute", backgroundColor: "red", width: 100, height: 100, zIndex: 100}}></View>*/}
            {/*<View>*/}
            {/*    <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur at atque, autem dolorum earum enim inventore minus modi necessitatibus optio sapiente totam, ut vel. At corporis dolores enim ex, facilis, fuga in omnis perferendis perspiciatis qui sit, suscipit temporibus vero.</Text>*/}
            {/*</View>*/}

            {/*<View style={{zIndex: Platform.OS === "web" ? "unset"}}>*/}
            {/*    <View style={{position: "absolute", width: 100, height: 200, backgroundColor: "red", zIndex: 100, elevation: 100}}></View>*/}
            {/*</View>*/}
            {/*<View>*/}
            {/*    /!*<View>*!/*/}
            {/*        <Text> ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate dolorem ducimus eius ipsum iste natus non numquam quo similique suscipit.</Text>*/}

            {/*    /!*</View>*!/*/}
            {/*</View>*/}
        </Limiter>
    );
}