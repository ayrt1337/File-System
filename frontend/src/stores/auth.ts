import { defineStore } from "pinia";
import type { User } from "../types/user";
import { jwtDecode } from "jwt-decode";

const decodeStoredToken = (token: string) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

export const hasValidSessionStored = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const decodedToken = decodeStoredToken(token) as { exp?: number } | null;
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
    updateUser(user: Partial<User>) {
      this.user = this.user ? { ...this.user, ...user } : (user as User);
      localStorage.setItem("user", JSON.stringify(this.user));
    },
    logout() {
      this.user = null;
      this.token = "";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});
