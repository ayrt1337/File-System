import { defineStore } from "pinia";
import type { User } from "../types/user";

const decodeStoredToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const hasValidSessionStored = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const decodedToken = decodeStoredToken(token) as { exp?: number } | null;
  console.log(decodedToken)
  if (!decodedToken || typeof decodedToken.exp !== "number") return false;

  return decodedToken.exp * 1000 > Date.now();
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: "",
  }),
  getters: {
    getUser(state) {
      if (state.user) return state.user;
      const stored = localStorage.getItem("user");
      return stored ? (JSON.parse(stored) as User) : null;
    },
  },
  actions: {
    setToken(data: { token: string, user: User }) {
      this.user = data.user;
      this.token = data.token;
      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));
    },
    updateUser(user: User) {
      this.user = user;
    },
    logout() {
      this.user = null;
      this.token = "";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});
