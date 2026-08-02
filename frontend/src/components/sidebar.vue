<script setup lang="ts">
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faFile, faStar } from "@fortawesome/free-regular-svg-icons";
import {
  faUsers,
  faArrowRightArrowLeft,
  faTrash,
  faArrowRightFromBracket,
  faDownload,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { router } from "../router";
import { useRoute } from "vue-router";
import { useLoading } from "../composables/use-loading";
import { useToast } from "../composables/use-toast";
import { api } from "../services/api";
import { useAuthStore } from "../stores/auth";
import { useUploadStore } from "../stores/upload";
import { API_ROUTES } from "../routing/routes";

const authStore = useAuthStore();
const uploadStore = useUploadStore();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const route = useRoute();

const emit = defineEmits<{
  (e: "navigate"): void;
}>();

const handleNavigation = (routeName: string, pathPrefix: string) => {
  if (!route.path.startsWith(pathPrefix)) {
    router.push({ name: routeName });
  }
  emit("navigate");
};

const handleLogout = async () => {
  emit("navigate");
  showLoadingPage(true);

  try {
    await api.get(API_ROUTES.AUTH.LOGOUT);
    authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Erro em deslogar: ", error);
    showLoadingPage(false);
    showToast("Algo deu errado!", "error");
  }
};

const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  uploadStore.uploadFiles(files);

  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  emit("navigate");
};
</script>

<template>
  <div
    class="flex flex-col justify-between py-6 lg:py-8 px-5 lg:px-7 text-[#cccccc] bg-[#121212] min-h-screen w-full max-lg:max-w-80 lg:max-w-64 xl:max-w-72 shrink-0 select-none overflow-y-auto transition-all duration-300"
  >
    <div>
      <div class="flex items-center justify-between">
        <p
          class="text-[20px] xl:text-[20px] font-semibold text-white tracking-wide truncate"
        >
          MyFileSystem
        </p>
        <button
          @click="emit('navigate')"
          class="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Fechar Menu"
        >
          <FontAwesomeIcon :icon="faXmark" class="h-5 w-5" />
        </button>
      </div>

      <div
        @click="triggerFileInput"
        class="cursor-pointer w-auto py-2.5 lg:py-3.5 xl:py-4 px-4 lg:px-5 xl:px-7 mt-4 lg:mt-5 inline-block bg-[#363333ac] hover:bg-[#444] rounded-[10px] select-none transition-all duration-300 border border-white/5"
      >
        <div class="flex items-center sm:justify-start">
          <p class="text-xl lg:text-2xl xl:text-[30px] mr-2 lg:mr-3 font-light">
            +
          </p>
          <p class="text-[20px] xl:text-[25px] font-medium">Novo</p>
        </div>
      </div>
      <input
        type="file"
        ref="fileInputRef"
        style="display: none"
        @change="handleFileChange"
        multiple
      />

      <div class="flex flex-col mt-5 lg:mt-8 xl:mt-10 gap-1">
        <div
          @click="handleNavigation('myFiles', '/my-files')"
          :style="
            route.path.startsWith('/my-files')
              ? 'background-color: #009900; color: white;'
              : ''
          "
          class="gap-2.5 lg:gap-3 py-2 lg:py-2.5 px-2.5 lg:px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[15px] lg:text-sm xl:text-[16px] cursor-pointer flex items-center"
        >
          <FontAwesomeIcon
            :icon="faFile"
            class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0"
          />
          <p class="truncate">Meus Arquivos</p>
        </div>

        <div
          @click="handleNavigation('sharedWithMe', '/shared-with-me')"
          :style="
            route.path.startsWith('/shared-with-me')
              ? 'background-color: #009900; color: white;'
              : ''
          "
          class="gap-2.5 lg:gap-3 py-2 lg:py-2.5 px-2.5 lg:px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[15px] lg:text-sm xl:text-[16px] cursor-pointer flex items-center"
        >
          <FontAwesomeIcon
            :icon="faUsers"
            class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0"
          />
          <p class="truncate">Compartilhados</p>
        </div>

        <div
          @click="handleNavigation('favorites', '/favorites')"
          :style="
            route.path.startsWith('/favorites')
              ? 'background-color: #009900; color: white;'
              : ''
          "
          class="gap-2.5 lg:gap-3 py-2 lg:py-2.5 px-2.5 lg:px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[15px] lg:text-sm xl:text-[16px] cursor-pointer flex items-center"
        >
          <FontAwesomeIcon
            :icon="faStar"
            class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0"
          />
          <p class="truncate">Favoritos</p>
        </div>
      </div>

      <div class="flex flex-col mt-4 lg:mt-6 xl:mt-10 gap-1">
        <div
          @click="handleNavigation('convertFilesOptions', '/convert-files')"
          :style="
            route.path.startsWith('/convert-files')
              ? 'background-color: #009900; color: white;'
              : ''
          "
          class="gap-2.5 lg:gap-3 py-2 lg:py-2.5 px-2.5 lg:px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[15px] lg:text-sm xl:text-[16px] cursor-pointer flex items-center"
        >
          <FontAwesomeIcon
            :icon="faArrowRightArrowLeft"
            class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0"
          />
          <p class="truncate">Converter Arquivos</p>
        </div>

        <div
          @click="handleNavigation('downloadVideosOptions', '/download-videos')"
          :style="
            route.path.startsWith('/download-videos')
              ? 'background-color: #009900; color: white;'
              : ''
          "
          class="gap-2.5 lg:gap-3 py-2 lg:py-2.5 px-2.5 lg:px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[15px] lg:text-sm xl:text-[16px] cursor-pointer flex items-center"
        >
          <FontAwesomeIcon
            :icon="faDownload"
            class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0"
          />
          <p class="truncate">Baixar Vídeos</p>
        </div>

        <div
          @click="handleNavigation('trash', '/trash')"
          :style="
            route.path.startsWith('/trash')
              ? 'background-color: #009900; color: white;'
              : ''
          "
          class="gap-2.5 lg:gap-3 py-2 lg:py-2.5 px-2.5 lg:px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[15px] lg:text-sm xl:text-[16px] cursor-pointer flex items-center"
        >
          <FontAwesomeIcon
            :icon="faTrash"
            class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0"
          />
          <p class="truncate">Lixeira</p>
        </div>
      </div>

      <div class="flex flex-col mt-4 lg:mt-6 xl:mt-10 gap-1">
        <div
          @click="handleNavigation('profile', '/profile')"
          :style="
            route.path.startsWith('/profile')
              ? 'background-color: #009900; color: white;'
              : ''
          "
          class="gap-2.5 lg:gap-3 py-2 lg:py-2.5 px-2.5 lg:px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[15px] lg:text-sm xl:text-[16px] cursor-pointer flex items-center"
        >
          <FontAwesomeIcon
            :icon="faUser"
            class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0"
          />
          <p class="truncate">Perfil</p>
        </div>
      </div>
    </div>

    <div
      @click="handleLogout()"
      class="mt-4 lg:mt-6 gap-2.5 lg:gap-3 py-2 lg:py-2.5 px-2.5 lg:px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[15px] lg:text-sm xl:text-[16px] cursor-pointer flex items-center text-red-400 hover:text-red-300"
    >
      <FontAwesomeIcon
        :icon="faArrowRightFromBracket"
        class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0"
      />
      <p class="truncate">Sair</p>
    </div>
  </div>
</template>
