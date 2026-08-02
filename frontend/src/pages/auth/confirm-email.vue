<script setup lang="ts">
import { onMounted, ref } from "vue";
import { router } from "../../router/index.ts";
import LoadingSpinner from "../../components/loading-spinner.vue";
import Container from "../../components/container.vue";
import BgContainer from "../../components/bg-container.vue";
import SuccessImage from "../../assets/success.png";
import FailImage from "../../assets/fail.png";
import { api } from "../../services/api";
import { API_ROUTES } from "../../routing/routes";

interface Props {
  token: string;
}

const props = defineProps<Props>();

const loading = ref<boolean>(true);
const success = ref<boolean>(false);

onMounted(async () => {
  try {
    await api.get(API_ROUTES.AUTH.CONFIRM_EMAIL, {
      params: { token: props.token },
    });

    success.value = true;
    loading.value = false;
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (error) {
    console.error("Erro na verificação do token: ", error);
    loading.value = false;
  }
});
</script>

<template>
  <LoadingSpinner v-if="loading" />

  <Container v-else>
    <BgContainer class="max-w-[700px] w-full p-4 sm:p-10 py-6 sm:py-12">
      <div>
        <div class="flex flex-col items-center justify-center" v-if="success">
          <img
            class="size-36 sm:size-[200px] mb-4 sm:mb-6 object-contain"
            :src="SuccessImage"
            alt="success"
          />
          <p class="text-center text-sm sm:text-[20px] text-gray-200">
            Conta cadastrada com sucesso! Você será redirecionado para o login
            em breve.
          </p>
        </div>

        <div class="flex flex-col items-center justify-center" v-else>
          <img
            class="size-36 sm:size-[200px] mb-4 sm:mb-6 object-contain"
            :src="FailImage"
            alt="error"
          />
          <p class="text-center text-sm sm:text-[20px] text-gray-200">
            Algo inesperado aconteceu, tente realizar o cadastro novamente.
          </p>
        </div>
      </div>
    </BgContainer>
  </Container>
</template>
