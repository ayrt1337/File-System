<script setup lang="ts">
import { ref, onMounted } from "vue";
import { router } from "../../router/index.ts";
import LoadingSpinner from "../../components/loading-spinner.vue";
import Container from "../../components/container.vue";
import BgContainer from "../../components/bg-container.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Input from "../../components/input.vue";
import SuccessImage from "../../assets/success.png";
import FailImage from "../../assets/fail.png";
import { api } from "../../services/api";
import * as z from "zod";

interface ConfirmPasswordData {
  password: string;
  confirmPassword: string;
}

interface Props {
  token: string;
}

const confirmPasswordSchema = z
  .object({
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

const props = defineProps<Props>();

const data = ref<ConfirmPasswordData>({
  password: "",
  confirmPassword: "",
});
const loading = ref<boolean>(true);
const inputLoading = ref<boolean>(false);
const success = ref<boolean>(false);
const formErrors = ref<Record<string, string>>({});
const errorMessage = ref<string>("");
const showInput = ref<boolean>(false);

onMounted(async () => {
  try {
    await api.get("/confirmEmail", {
      params: { token: props.token },
    });

    showInput.value = true;
    loading.value = false;
  } catch (error) {
    console.error("Erro na verificação do token: ", error);
    loading.value = false;
  }
});

const changePassword = async () => {
  errorMessage.value = "";
  formErrors.value = {};

  const result = confirmPasswordSchema.safeParse(data.value);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!formErrors.value[field]) {
        formErrors.value[field] = issue.message;
      }
    });
    return;
  }

  inputLoading.value = true;
  try {
    const result = await api.post(`/resetPassword`, {
      token: props.token,
      password: data.value.password,
    });

    const output = result.data;

    if (output == "success") {
      success.value = true;
      showInput.value = false;

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      success.value = false;
      showInput.value = false;
    }
  } catch (error: any) {
    console.log("Erro ao enviar a senha: ", error);
    inputLoading.value = false;
    errorMessage.value = error.response?.data || "Ops! Algo deu errado";
  }
};
</script>

<template>
  <LoadingSpinner v-if="loading" />

  <Container v-else>
    <BgContainer
      class="flex flex-col items-center justify-center max-w-[700px] p-15 py-13 pt-14"
    >
      <div class="w-full">
        <div
          class="w-full flex flex-col items-center justify-center"
          v-if="showInput"
        >
          <h1 class="mb-6 text-[18px]">Escreva abaixo a nova senha</h1>

          <p v-if="errorMessage" class="error text-red-500 text-center mb-4">
            {{ errorMessage }}
          </p>

          <Input
            class="mt-5 w-full"
            text="Senha"
            :password="true"
            v-model="data.password"
            leftIcon="faLock"
            :error="formErrors.password"
          />

          <Input
            class="mt-5 w-full"
            text="Confirmar Senha"
            :password="true"
            v-model="data.confirmPassword"
            leftIcon="faLock"
            :error="formErrors.confirmPassword"
          />

          <button
            type="button"
            :disabled="inputLoading"
            @click="changePassword()"
            class="disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6 cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <FontAwesomeIcon v-if="inputLoading" :icon="faSpinner" spin />
            Solicitar Alteração
          </button>
        </div>

        <div v-else>
          <div class="flex flex-col items-center justify-center" v-if="success">
            <img class="size-[200px] mb-6" :src="SuccessImage" alt="success" />
            <p class="text-center text-[20px]">
              Senha alterada com sucesso! Você será redirecionado para o login
              em breve.
            </p>
          </div>

          <div class="flex flex-col items-center justify-center" v-else>
            <img class="size-[200px] mb-6" :src="FailImage" alt="error" />
            <p class="text-center text-[20px]">
              Algo inesperado aconteceu, tente realizar a alteração de senha
              novamente.
            </p>
          </div>
        </div>
      </div>
    </BgContainer>
  </Container>
</template>
