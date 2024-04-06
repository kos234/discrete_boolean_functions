import {
    Image,
    Pressable,
    StyleSheet,
    Platform,
    Text,
    Appearance,
    View,
    useWindowDimensions,
    KeyboardAvoidingView, TouchableWithoutFeedback
} from 'react-native';
import {Link, NavigationContainer, NavigationState} from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import HomePage from "./pages/HomePage";
// @ts-ignore
import DarkTheme from './imgs/dark_mode.svg';
// @ts-ignore
import LightTheme from './imgs/light_mode.svg';
// @ts-ignore
import ArrowBack from './imgs/arrow_back.svg';
import {useEffect, useRef, useState} from "react";
import {DarkMode, LightMode, AppContext} from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getLinking, Tasks} from "./contents";
import {calculateDefaultStyle} from "./globalStyles";
import NonSelectPressable from "./components/NonSelectPressable";
import {PartialState} from "@react-navigation/routers/lib/typescript/src/types";
import {GestureResponderEvent} from "react-native/Libraries/Types/CoreEventTypes";

const Stack = createNativeStackNavigator();

export default function App() {
    const [colorScheme, setColorScheme] = useState(LightMode);
    const [currentScheme, setCurrentScheme] = useState("light");
    const [currentPage, setCurrentPage] = useState("");
    const {height, width} = useWindowDimensions();
    const listenersTouchEnd = useRef([]);

    console.log("link", getLinking());
    console.log("link", getLinking());
    console.log("link", getLinking());

    function toggleTheme() {
        if (currentScheme === "dark") {
            setColorScheme(LightMode);
            setCurrentScheme("light");
            AsyncStorage.setItem("schemeMode", "light");
        } else {
            setColorScheme(DarkMode);
            setCurrentScheme("dark");
            AsyncStorage.setItem("schemeMode", "dark");
        }
    }

    function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
        if (!state)
            return "";
        const route = state.routes[state?.index || 0];
        if (route.state) {
            return getActiveRouteName(route.state);
        }

        return route.name;
    }

    function sendTouchEndEvent(touchEvent: GestureResponderEvent): void {
        listenersTouchEnd.current.forEach(handler => {
            handler(touchEvent);
        })
    }

    function subscribeTouchEnd(handler: (event: GestureResponderEvent) => void) {
        listenersTouchEnd.current.push(handler);
    }

    function unsubscribeTouchEnd(handler: (event: GestureResponderEvent) => void) {
        const index = listenersTouchEnd.current.indexOf(handler);
        if (index === -1)
            return;

        listenersTouchEnd.current.splice(index, 1);
    }

    const defaultStyle = calculateDefaultStyle(width);

    const screenOptions = {
        statusBarStyle: colorScheme.statusBarStyle,
        statusBarColor: colorScheme.cardColor,
        navigationBarColor: colorScheme.backgroundColor,
        headerStyle: {
            backgroundColor: colorScheme.cardColor,
            height: defaultStyle.fontSize_title.headerHeight,
            borderBottomColor: colorScheme.outlineColor,
        },
        contentStyle: {
            backgroundColor: colorScheme.backgroundColor,
        },
        headerLeft: () => (
            currentPage !== "" && currentPage !== "main" ?
                <Link to={getLinking().config.screens[currentPage].initialRouteName} style={{
                    paddingLeft: Platform.OS === "web" ? 15 : 0,
                    paddingRight: Platform.OS === "web" ? 0 : 10,
                }}>
                    <View style={{justifyContent: "center", height: "100%"}}>
                        <ArrowBack height={Platform.OS === "web" ? defaultStyle.fontSize_title.backIconSize : 24}
                                   width={Platform.OS === "web" ? defaultStyle.fontSize_title.backIconSize : 24}
                                   fill={colorScheme.textColor}></ArrowBack>
                    </View>
                </Link> : null
        ),
        headerTintColor: colorScheme.textColor,
        headerRight: () => (
            <NonSelectPressable onPress={toggleTheme} style={{
                marginRight: Platform.OS === "web" ? 20 : 0,
                height: "100%",
                justifyContent: "center"
            }}>
                {currentScheme === "light" ?
                    <DarkTheme height={Platform.OS === "web" ? defaultStyle.fontSize_title.themeIconSize : 24}
                               width={Platform.OS === "web" ? defaultStyle.fontSize_title.themeIconSize : 24}/> : null}
                {currentScheme === "dark" ?
                    <LightTheme height={Platform.OS === "web" ? defaultStyle.fontSize_title.themeIconSize : 24}
                                width={Platform.OS === "web" ? defaultStyle.fontSize_title.themeIconSize : 24}/> : null}
            </NonSelectPressable>
        ),
    };

    if (Platform.OS === "web") {
        //@ts-ignore
        screenOptions.headerTitleStyle = {
            fontSize: defaultStyle.fontSize_title.fontSize
        };
    }

    useEffect(() => {
        setColorScheme(Appearance.getColorScheme() === "dark" ? DarkMode : LightMode);
        AsyncStorage.getItem("schemeMode").then(res => {
            if (res) {
                setColorScheme(res === "dark" ? DarkMode : LightMode);
                setCurrentScheme(res === "dark" ? "dark" : "light");
            }
        });
    }, []);

    useEffect(() => {
        if (Platform.OS === "web") {
            let styleScrollBar = document.head.querySelector("#custom_scroll_bar");
            if (!styleScrollBar) {
                styleScrollBar = document.createElement("style");
                styleScrollBar.id = "custom_scroll_bar";
                document.head.appendChild(styleScrollBar);
            }
            styleScrollBar.innerHTML = `
                ::-webkit-scrollbar-thumb {
                    background-color: ${colorScheme.scrollBarColor};
                    cursor: pointer;
                }
                ::-webkit-scrollbar {
                    background-color: ${colorScheme.scrollBarBackground};
                    width: 13px
                }
            `;
        }
    }, [colorScheme]);

    return (
        <AppContext.Provider value={{
            colorScheme: colorScheme,
            defaultStyle: defaultStyle,
            subscribeTouchEnd: subscribeTouchEnd,
            unsubscribeTouchEnd: unsubscribeTouchEnd,
            sendTouchEndEvent: sendTouchEndEvent,
        }}>
            <KeyboardAvoidingView behavior={"padding"}
                                  style={{flex: 1, backgroundColor: colorScheme.backgroundColor}}>

                {/*//@ts-ignore*/}
                <Pressable onPress={sendTouchEndEvent} style={{flex: 1, cursor: "auto"}}>
                    <NavigationContainer linking={getLinking()}
                                         ref={(e) => {
                                             if (currentPage === "" && e)
                                                 setCurrentPage(getActiveRouteName(e.getState()));
                                         }}
                                         onStateChange={(state) => {
                                             setCurrentPage(getActiveRouteName(state));
                                         }}>
                        {/*//@ts-ignore*/}
                        <Stack.Navigator screenOptions={screenOptions}>
                            <Stack.Screen name="main" component={HomePage}
                                          options={{title: "Булевы функции | Главная"}}/>
                            {Tasks.map((e, index) => (
                                //@ts-ignore
                                <Stack.Screen navigationKey={e.id} key={e.id} name={e.id} component={e.component}
                                              options={{title: e.title + " | " + (index + 1)}}/>
                            ))}
                        </Stack.Navigator>
                    </NavigationContainer>
                </Pressable>
            </KeyboardAvoidingView>
        </AppContext.Provider>
    )
        ;
}
const styles = StyleSheet.create({});
