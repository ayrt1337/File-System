<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import MainPageTemplate from "../../components/main-page-template.vue";
import UserImage from "../../assets/981d6b2e0ccb5e968a0618c8d47671da.jpg";
import Input from "../../components/input.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCamera } from "@fortawesome/free-regular-svg-icons";
import {
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { router } from "../../router/index.ts";
import Overlay from "../../components/overlay.vue";
import { api } from "../../services/api";
import { useToast } from "../../composables/use-toast";
import * as z from "zod";
import { API_ROUTES } from "../../routing/routes";
import type { User } from "../../types/user.ts";
import { useAuthStore } from "../../stores/auth.ts";
import { useLoading } from "../../composables/use-loading.ts";
import { verifyApiError } from "../../services/verify-api-error.ts";

const { showLoadingPage } = useLoading();

const authStore = useAuthStore();
const { showToast } = useToast();
const inputLoading = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);
const data = ref<User>({
  name: "",
  email: "",
  avatarUrl: ""
});

const hasChanges = computed(() => {
  if (!authStore.getUser) return false;
  return Object.keys(data.value).some(
    (key) => data.value[key as keyof User] !== (authStore.getUser as User)[key as keyof User]
  );
});

const getProfile = async () => {
  showLoadingPage(true);

  try {
    const response = await api.get(API_ROUTES.USER.PROFILE);
    data.value = { ...response.data };
    authStore.updateUser(response.data);
  } catch (error: any) {
    console.error("Erro ao buscar usuário: ", error);
    verifyApiError(error.response?.status);
  } finally {
    showLoadingPage(false);
  }
};

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Preencha o campo!")
    .min(3, "O nome deve ter no mínimo 3 caracteres!"),
});

const formErrors = ref<Record<string, string>>({});

const handleUpdate = async () => {
  formErrors.value = {};
  const result = profileSchema.safeParse({ name: data.value.name });
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
    const payload: Partial<User> = { name: data.value.name };
    if (data.value.avatarUrl) {
      payload.avatarUrl = data.value.avatarUrl;
    }
    await api.patch(API_ROUTES.USER.UPDATE, payload);
    authStore.updateUser(payload as User);
    showToast("Alterações salvas com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao atualizar os dados: ", error);
    showToast("Erro ao atualizar os dados.", "error");
  } finally {
    inputLoading.value = false;
  }
};

const confirmDelete = async () => {
  showDeleteConfirm.value = false;
  inputLoading.value = true;

  try {
    await api.patch(API_ROUTES.USER.DELETE);
    showToast("Conta excluída com sucesso!", "success");
    authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Erro ao atualizar os dados: ", error);
    showToast("Erro ao excluir conta.", "error");
  } finally {
    inputLoading.value = false;
  }
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível obter o contexto do canvas"));
          return;
        }

        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/webp", 0.8);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const handleImageChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    showToast("A imagem deve ter no máximo 5MB.", "error");
    return;
  }

  inputLoading.value = true;
  try {
    const compressedBase64 = await compressImage(file);
    data.value.avatarUrl = compressedBase64;
  } catch (error) {
    console.error("Erro ao processar a imagem: ", error);
    showToast("Erro ao carregar a imagem.", "error");
  } finally {
    inputLoading.value = false;
    if (target) target.value = "";
  }
};

onMounted(() => getProfile());
</script>

<template>
  <MainPageTemplate title="Perfil" :sidebar="true" :header="false">
    <div class="text-[#ffffff]">
      <Overlay v-if="showDeleteConfirm">
        <Transition name="modal-fade" appear>
          <div
            class="relative bg-[#1a1a1a] border border-[#333] w-full max-w-[400px] rounded-[24px] p-8 shadow-2xl overflow-hidden"
          >
            <div class="flex flex-col items-center text-center">
              <div
                class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6"
              >
                <FontAwesomeIcon
                  :icon="faTriangleExclamation"
                  class="text-3xl text-red-500"
                />
              </div>

              <h3 class="text-xl font-bold text-white mb-2">Excluir Conta?</h3>
              <p class="text-gray-400 text-sm leading-relaxed mb-8">
                Esta ação é permanente e todos os seus dados serão removidos.
                Tem certeza que deseja continuar?
              </p>

              <div class="flex gap-3 w-full">
                <button
                  @click="showDeleteConfirm = false"
                  class="cursor-pointer flex-1 px-6 py-3 rounded-full bg-[#333] hover:bg-[#444] text-white font-semibold transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  :disabled="inputLoading"
                  @click="confirmDelete()"
                  class="cursor-pointer flex-1 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-red-900/20"
                >
                  <FontAwesomeIcon v-if="inputLoading" :icon="faSpinner" spin />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Overlay>

      <div>
        <h2 class="text-[20px] font-medium">Foto de Perfil</h2>

        <div @click="triggerFileInput" class="relative w-fit mt-2 cursor-pointer group">
          <img
            :src="data.avatarUrl || UserImage"
            class="mt-[10px] rounded-full size-[120px] object-cover group-hover:opacity-80 transition-opacity duration-300"
          />
          <div class="absolute bottom-[0px] right-[0px]">
            <FontAwesomeIcon
              :icon="faCamera"
              class="scale-y-112 scale-x-103 rounded-full bg-[#1f1f1f] p-2 border border-[#333] hover:bg-gray-800 transition-colors text-[20px] text-[#22c55e]"
            />
          </div>
        </div>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          class="hidden"
          @change="handleImageChange"
        />
      </div>

      <div class="mt-[60px]">
        <h2 class="text-[20px] mb-3 font-medium">Email</h2>
        <p>{{ data.email }}</p>
      </div>

      <div class="mt-[50px]">
        <h2 class="text-[20px] mb-3 font-medium">Nome</h2>

        <Input
          class="max-w-[500px]"
          v-model="data.name"
          leftIcon="faUser"
          :error="formErrors.name"
        />
      </div>

      <div class="flex mt-[50px]">
        <div class="mr-3">
          <button
            @click="handleUpdate()"
            type="submit"
            :disabled="inputLoading || !hasChanges"
            class="text-white cursor-pointer text-[15px] flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-2.5 px-6 rounded-full transition-all duration-300 transform disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <FontAwesomeIcon v-if="inputLoading" :icon="faSpinner" spin />
            Salvar Alterações
          </button>
        </div>

        <div>
          <button
            @click="showDeleteConfirm = true"
            type="submit"
            class="text-white cursor-pointer flex-1 bg-red-600 hover:bg-red-500 text-black font-bold text-[15px] py-2.5 px-6 rounded-full transition-all duration-300 transform disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            Excluir Conta
          </button>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>
