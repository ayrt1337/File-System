import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/login.vue";
import Register from "../pages/register.vue";
import Email from "../pages/email-sent.vue";
import ConfirmEmail from "../pages/confirm-email.vue";
import Reset from "../pages/reset.vue";
import ConfirmPassword from "../pages/confirm-password.vue";
import MyFiles from "../pages/my-files.vue";
import NotFound from "../pages/not-found.vue";
import Profile from "../pages/profile.vue";

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

    {
        path: "/my-files",
        name: "myFiles",
        component: MyFiles
    },

    {
        path: "/profile",
        name: "profile",
        component: Profile,
        props: true
    },

    {
        path: "/:pathMatch(.*)*",
        name: "notFound",
        component: NotFound
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});