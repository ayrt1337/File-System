import { createRouter, createWebHistory, RouterView } from "vue-router";
import { resetPageState } from "../services/page-reset-state";
import { useServerError } from "../composables/use-server-error.ts";
import { useLoading } from "../composables/use-loading.ts";
import { hasValidSessionStored } from "../stores/auth.ts";
import { verifyApiError } from "../services/verify-api-error.ts";
import { api } from "../services/api.ts";

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
    path: "/confirm-email/:token",
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
    path: "/confirm-password/:token",
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
    path: "/trash",
    name: "trash",
    component: () => import("../pages/files/trash.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/favorites",
    name: "favorites",
    component: () => import("../pages/files/favorites.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("../pages/profile/profile.vue"),
    props: true,
    meta: { requiresAuth: true },
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
    path: "/download-videos",
    component: RouterView,
    meta: { requiresAuth: true, static: true },
    children: [
      {
        path: "",
        name: "downloadVideosOptions",
        component: () => import("../pages/download-videos/options.vue"),
      },
      {
        path: "download",
        name: "downloadVideosForm",
        component: () => import("../pages/download-videos/download.vue"),
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

router.beforeEach((to) => {
  resetPageState();

  if (to.meta.requiresAuth) {
    const { showServerErrorPage } = useServerError();

    try {
      if (!hasValidSessionStored()) router.push("/login");
    } catch (error: any) {
      console.error("Erro ao verificar usuário:", error);
      showServerErrorPage(true);
    }
  }
});

router.afterEach(async (to) => {
  if ((to.meta.static && to.meta.requiresAuth) && hasValidSessionStored()) {
    const { showLoadingPage } = useLoading();
    showLoadingPage(true);

    try {
      await api.get("/me");
    } catch (error: any) {
      console.error("Erro ao verificar usuário: ", error);
      verifyApiError(error.response?.status);
    } finally {
      showLoadingPage(false);
    }
  }
});
