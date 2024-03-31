import Task1 from "./pages/Task1";
import Task2 from "./pages/Task2";
import Task3 from "./pages/Task3";
import Task4 from "./pages/Task4";
import Task5 from "./pages/Task5";
import TestPage from "./pages/TestPage";
import Task6 from "./pages/Task6";

export const Tasks = [
    {title: "Построение функции", id: "task1", component: Task1},
    {title: "Остаточная функции", id: "task2", component: Task2},
    {title: "Функция по остаточным", id: "task3", component: Task3},
    {title: "Игра. Имя функции", id: "task4", component: Task4},
    {title: "Игра. Существенные и фиктивные переменные", id: "task5", component: Task5},
    {title: "Игра. ДНФ", id: "task6", component: Task6},
    {title: "Тест", id: "task777", component: TestPage},
]

export const linking = {
    prefixes: ['https://testTasks.test', 'testTasks://'],
    config: {
        screens: {
            main: "",
            task1: {
                path: "/task/1",
                initialRouteName: "/"
            },
            task2: {
                path: "/task/2",
                initialRouteName: "/"
            },
            task3: {
                path: "/task/3",
                initialRouteName: "/"
            },
            task4: {
                path: "/task/4",
                initialRouteName: "/"
            },
            task5: {
                path: "/task/5",
                initialRouteName: "/"
            },
            task6: {
                path: "/task/6",
                initialRouteName: "/"
            },
            task777: {
                path: "/task/777",
                initialRouteName: "/"
            },
        }
    },
};