<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Container from "../../components/container.vue";
import BgContainer from "../../components/bg-container.vue";
import Input from "../../components/input.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "../../assets/unnamed.jpg";
import { api } from "../../services/api";
import * as z from "zod";
import { API_ROUTES } from "../../routing/routes";

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

const registerSchema = z
  .object({
    email: z.string().min(1, "Preencha o campo!").email("Email inválido!"),
    password: z
      .string()
      .min(1, "Preencha o campo!")
      .min(6, "A senha deve ter no mínimo 6 caracteres!"),
    confirmPassword: z.string().min(1, "Preencha o campo!"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas devem ser iguais!",
        path: ["password"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas devem ser iguais!",
        path: ["confirmPassword"],
      });
    }
  });

const data = ref<RegisterData>({
  email: "",
  password: "",
  confirmPassword: "",
});
const loading = ref<boolean>(false);
const formErrors = ref<Record<string, string>>({});
const errorMessage = ref<string>();
const router = useRouter();

const handleRegister = async () => {
  errorMessage.value = "";
  formErrors.value = {};

  const result = registerSchema.safeParse(data.value);

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
    await api.post(API_ROUTES.AUTH.REGISTER, {
      email: data.value.email,
      password: data.value.password,
    });

    router.push({
      name: "email",
      state: {
        email: data.value.email,
        password: data.value.password,
        reason: "confirmation",
      },
    });
  } catch (error: any) {
    console.log("Erro no envio de email: ", error);
    loading.value = false;
    errorMessage.value = error.response?.data || "Ops! Algo deu errado";
  }
};
</script>

<template>
  <Container>
    <BgContainer
      class="w-full max-w-[600px] min-[1360px]:max-w-6xl min-[1360px]:min-h-[70vh] h-auto flex justify-center min-[1360px]:flex-row my-auto"
    >
      <div
        class="w-full min-[1360px]:w-1/2 px-15 py-25 max-[650px]:px-7 max-[650px]:py-16 min-[1360px]:py-16 flex flex-col justify-center relative z-20 bg-[#121212]"
      >
        <div class="w-full min-[1360px]:max-w-md min-[1360px]:mx-auto">
          <div class="mb-6 sm:mb-10">
            <h1
              class="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2 text-center"
            >
              Cadastrar Conta
            </h1>
            <p class="text-base text-gray-500 text-center">Junte-se a nós hoje!</p>
          </div>

          <p v-if="errorMessage" class="error text-red-500 text-center text-base mb-2">
            {{ errorMessage }}
          </p>

          <form @submit.prevent="handleRegister" class="mt-3 sm:mt-5 space-y-4 sm:space-y-6">
            <Input
              text="Email"
              v-model="data.email"
              leftIcon="faEnvelope"
              :error="formErrors.email"
            />

            <Input
              text="Senha"
              :password="true"
              v-model="data.password"
              leftIcon="faLock"
              :error="formErrors.password"
            />

            <Input
              text="Confirmar Senha"
              :password="true"
              v-model="data.confirmPassword"
              leftIcon="faLock"
              :error="formErrors.confirmPassword"
            />

            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                :disabled="loading"
                class="cursor-pointer w-full sm:flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3 sm:py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FontAwesomeIcon v-if="loading" :icon="faSpinner" spin />
                Cadastrar
              </button>

              <button
                type="button"
                @click="router.push('/login')"
                class="cursor-pointer w-full sm:flex-1 bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 font-bold py-3 sm:py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        class="hidden min-[1360px]:block min-[1360px]:w-1/2 relative overflow-hidden"
      >
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
