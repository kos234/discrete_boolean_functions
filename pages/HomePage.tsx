import TaskButton from "../components/TaskButton";
import {Tasks} from "../contents";
import Limiter from "../components/Limiter";
import {Text, View} from "react-native";

export default function HomePage() {

    return (
        <Limiter style={{
            alignItems: "center", paddingLeft: 30, paddingRight: 30,
            gap: 30,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
        }}>

            {/*<View style={{position: "relative"}}>*/}
            {/*    <View style={{position: "absolute", left: 0, top: 0, backgroundColor: "red", width: 400, zIndex: 2}}>*/}
            {/*        <View>*/}
            {/*            <View>*/}
            {/*                <View>*/}
            {/*                    <Text style={{color: "white"}}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad aut consequatur deleniti excepturi facere mollitia natus nemo perspiciatis tempore temporibus!</Text>*/}

            {/*                </View>*/}
            {/*            </View>*/}
            {/*        </View>*/}
            {/*    </View>*/}
            {/*    <Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad animi aperiam consequatur culpa delectus id impedit in iusto laudantium libero molestiae nobis provident, quam quia, saepe, temporibus tenetur ullam voluptatibus! Eveniet minima molestiae numquam omnis quo. Dignissimos eaque eos expedita ipsum, labore laborum, libero odio omnis, optio porro quas quidem.</Text>*/}
            {/*</View>*/}

            {Tasks.map((e, index) => (
                <TaskButton key={e.id} id={e.id} number={index + 1} title={e.title}></TaskButton>
            ))}
        </Limiter>
    );
}