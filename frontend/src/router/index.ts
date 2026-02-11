import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/login/index.vue"
import Register from "../components/register/index.vue"
import Email from "../components/email-sent/index.vue"
import ConfirmEmail from "../components/confirm-email/index.vue"

const routes = [
    {
        path: "/login",
        name: "login",
        component: Login
    },

    {
        path: "/register",
        name: "register",
        component: Register
    },

    {
        path: "/email",
        name: "email",
        component: Email
    },

    {
        path: "/confirmEmail/:token",
        name: "confirmEmail",
        component: ConfirmEmail,
        props: true
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})