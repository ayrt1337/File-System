<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Container from "../../components/container.vue";
import Input from "../../components/input.vue";
import BgContainer from "../../components/bg-container.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "../../assets/unnamed.jpg";
import { api } from "../../services/api";
import * as z from "zod";
import { useAuthStore } from "../../stores/auth.ts";
import { API_ROUTES } from "../../routing/routes";

const authStore = useAuthStore();

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const loginSchema = z.object({
  email: z.string().min(1, "Preencha o campo!").email("Email inválido!"),
  password: z.string().min(1, "Preencha o campo!"),
});

const data = ref<LoginData>({
  email: "",
  password: "",
});
const loading = ref<boolean>(false);
const formErrors = ref<Record<string, string>>({});
const router = useRouter();
const errorMessage = ref<string>("");

const handleLogin = async () => {
  errorMessage.value = "";
  formErrors.value = {};
  const result = loginSchema.safeParse(data.value);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!formErrors.value[field]) {
        formErrors.value[field] = issue.message;
      }
    });
    return;
  }
  loading.value = true;
  try {
    const response = await api.post(API_ROUTES.AUTH.LOGIN, {
      email: data.value.email,
      password: data.value.password,
      rememberMe: data.value.rememberMe,
    });

    if (!response || !response.data.token || !response.data.user) {
      errorMessage.value = "Ops! Algo deu errado";
      return;
    }

    authStore.setToken(response.data);
    router.push({ name: "myFiles" });
  } catch (error: any) {
    console.error("Erro no login: ", error);
    errorMessage.value = error.response?.data || "Ops! Algo deu errado";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Container>
    <BgContainer class="max-w-6xl h-[70vh] flex">
      <div
        class="w-full lg:w-1/2 pr-0 p-8 md:py-12 lg:py-16 flex flex-col justify-center relative z-20 bg-[#121212]"
      >
        <div class="max-w-md mx-auto w-full">
          <div class="mb-10">
            <h1
              class="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2 text-center"
            >
              Bem Vindo!
            </h1>
            <p class="text-gray-500 text-center">
              Faça o login para a sua conta
            </p>
          </div>

          <p v-if="errorMessage" class="error text-red-500 text-center">
            {{ errorMessage }}
          </p>

          <form @submit.prevent="handleLogin" class="mt-5 space-y-6">
            <Input
              leftIcon="faEnvelope"
              text="Email"
              v-model="data.email"
              :error="formErrors.email"
            />

            <Input
              text="Senha"
              :password="true"
              v-model="data.password"
              :error="formErrors.password"
              leftIcon="faLock"
            />

            <div class="flex justify-between items-center text-sm">
              <label class="flex items-center cursor-pointer group">
                <input
                  v-model="data.rememberMe"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="relative w-11 h-6 bg-[#1a1a1a] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#22c55e]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-500 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e] peer-checked:after:bg-white peer-checked:after:border-transparent"
                ></div>
                <span
                  class="ml-3 text-gray-500 group-hover:text-gray-400 transition select-none"
                  >Manter login</span
                >
              </label>
              <a
                @click="router.push('/reset')"
                class="cursor-pointer text-[#00b300] hover:text-[#22c55e] transition-colors font-medium"
                >Esqueceu a senha?</a
              >
            </div>

            <div class="flex gap-4 pt-2">
              <button
                type="submit"
                :disabled="loading"
                class="cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <FontAwesomeIcon v-if="loading" :icon="faSpinner" spin />
                Login
              </button>

              <button
                type="button"
                @click="router.push('/register')"
                class="cursor-pointer flex-1 bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 font-bold py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Cadastrar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          class="absolute inset-0 flex flex-col items-center justify-center z-30 text-center pl-0 p-12"
        >
          <div
            class="w-full h-full relative rounded-xl backdrop-blur-sm flex flex-col items-center justify-center p-8"
          >
            <div class="mb-6 p-4">
              <img :src="Image" alt="" />
            </div>
          </div>
        </div>
      </div>
    </BgContainer>
  </Container>
</template>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}
</style>
