import Task1 from "./pages/Task1";
import Task2 from "./pages/Task2";

export const Tasks = [
    {title: "Построение функции", id: "task1", component: Task1},
    {title: "Остаточная функции", id: "task2", component: Task2},
    {title: "Построение функции2", id: "task3", component: Task1},
    {title: "Построение функции3", id: "task4", component: Task1},
    {title: "Построение функции4", id: "task5", component: Task1},
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
        }
    },
};