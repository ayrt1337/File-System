import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/login/index.vue"
import Register from "../components/register/index.vue"
import Email from "../components/email-sent/index.vue"
import ConfirmEmail from "../components/confirm-email/index.vue"
import Reset from "../components/reset/index.vue"
import ConfirmPassword from "../components/confirm-password/index.vue"

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
    },

    {
        path: "/reset",
        name: "reset",
        component: Reset,
    },

    {
        path: "/confirmPassword/:token",
        name: "confirmPassword",
        component: ConfirmPassword,
        props: true
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});