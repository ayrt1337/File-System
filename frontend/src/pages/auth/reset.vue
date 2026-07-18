<script setup lang="ts">
import { ref } from "vue";
import { router } from "../../router";
import Container from "../../components/container.vue";
import BgContainer from "../../components/bg-container.vue";
import Input from "../../components/input.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { api } from "../../services/api";
import * as z from "zod";
import { API_ROUTES } from "../../routing/routes";

interface ResetData {
  email: string;
}

const resetSchema = z.object({
  email: z.string().min(1, "Preencha o campo!").email("Email inválido!"),
});

const data = ref<ResetData>({
  email: "",
});
const loading = ref<boolean>(false);
const formErrors = ref<Record<string, string>>({});
const errorMessage = ref<string>("");

const sendEmail = async (): Promise<void> => {
  errorMessage.value = "";
  formErrors.value = {};

  const result = resetSchema.safeParse(data.value);

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
    await api.post(API_ROUTES.AUTH.RESET, { email: data.value.email });

    router.push({
      name: "email",
      state: { email: data.value.email, reason: "reset" },
    });
  } catch (error: any) {
    console.log("Erro no envio de email: ", error);
    errorMessage.value = error.response?.data || "Ops! Algo deu errado";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Container>
    <BgContainer
      class="flex flex-col items-center justify-center max-w-[700px] p-15 py-13 pt-14"
    >
      <h1 class="mb-6 text-[18px]">
        Digite o email da conta que deseja trocar a senha
      </h1>

      <p v-if="errorMessage" class="error text-red-500 text-center mb-4">
        {{ errorMessage }}
      </p>

      <Input
        class="w-full"
        text="Email"
        v-model="data.email"
        leftIcon="faEnvelope"
        :error="formErrors.email"
      />

      <button
        type="button"
        :disabled="loading"
        @click="sendEmail()"
        class="mt-6 cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        <FontAwesomeIcon v-if="loading" :icon="faSpinner" spin />
        Solicitar Alteração
      </button>
    </BgContainer>
  </Container>
</template>
