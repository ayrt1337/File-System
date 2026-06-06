import { createRouter, createWebHistory, RouterView } from "vue-router";
import { resetPageState } from "../services/page-reset-state";
import { useUser } from "../composables/use-user";
import { useLoading } from "../composables/use-loading";
import { verifyApiError } from "../services/verify-api-error";
import { api } from "../services/api";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/auth/login.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../pages/auth/register.vue"),
  },
  {
    path: "/email",
    name: "email",
    component: () => import("../pages/auth/email-sent.vue"),
  },
  {
    path: "/confirmEmail/:token",
    name: "confirmEmail",
    component: () => import("../pages/auth/confirm-email.vue"),
    props: true,
  },
  {
    path: "/reset",
    name: "reset",
    component: () => import("../pages/auth/reset.vue"),
  },
  {
    path: "/confirmPassword/:token",
    name: "confirmPassword",
    component: () => import("../pages/auth/confirm-password.vue"),
    props: true,
  },
  {
    path: "/my-files",
    name: "myFiles",
    component: () => import("../pages/files/my-files.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("../pages/profile/profile.vue"),
    props: true,
    meta: { requiresAuth: true, static: true },
  },
  {
    path: "/convert-files",
    component: RouterView,
    meta: { requiresAuth: true, static: true },
    children: [
      {
        path: "",
        name: "convertFilesOptions",
        component: () => import("../pages/convert-files/options.vue"),
      },
      {
        path: "upload",
        name: "convertFilesUpload",
        component: () => import("../pages/convert-files/upload.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notFound",
    component: () => import("../pages/not-found/not-found.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(() => {
  resetPageState();
  return;
});

router.afterEach(async (current, before) => {
  const { setUser } = useUser();
  const { showLoadingPage } = useLoading();

  if (current.meta.requiresAuth && current.path !== before.path) {
    if (current.meta.static) showLoadingPage(true);

    try {
      const response = await api("/profile");
      setUser(response.data);
    } catch (error: any) {
      console.error("Erro ao verificar usuário:", error);
      verifyApiError(error.response?.status);
    } finally {
      if (current.meta.static) showLoadingPage(false);
    }
  }
});
