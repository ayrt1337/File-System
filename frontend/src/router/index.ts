import { createRouter, createWebHistory } from "vue-router";
import type { Route } from "../types/route";
import Login from "../components/login/index.vue"
import Register from "../components/register/index.vue"

const routes: Route[] = [
    {
        path: "/login",
        name: "login",
        component: Login
    },

    {
        path: "/register",
        name: "register",
        component: Register
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})