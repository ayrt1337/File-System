<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFilesUtils } from "../../utils/files-utils.ts";
import { useAuthStore } from "../../stores/auth.ts";
import UserImage from "../../assets/981d6b2e0ccb5e968a0618c8d47671da.jpg";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import FileShareModal from "../../components/file-share-modal.vue";
import FileRenameModal from "../../components/file-rename-modal.vue";
import {
  faDownload,
  faShareNodes,
  faPen,
  faStar,
  faLock,
  faChevronDown,
  faFolderOpen,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import type { UserFile } from "../../types/file";
import { api } from "../../services/api";
import {
  API_ROUTES,
  getRouteWithPathParams,
  PARAMS,
} from "../../routing/routes";
import { useFilesServices } from "../../services/files-services.ts";
import { useLoading } from "../../composables/use-loading.ts";
import { verifyApiError } from "../../services/verify-api-error.ts";
import MainPageTemplate from "../../components/main-page-template.vue";
import { useFileCacheStore } from "../../stores/file-cache";
import { useToast } from "../../composables/use-toast.ts";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const { getFileIcon, getFileBgClass, isImage, isVideo, isAudio, hasPreview, hasView } = useFilesUtils();
const { downloadFile, toggleFavorite } = useFilesServices();
const { showLoadingPage } = useLoading();
const { showToast } = useToast();

const user = computed(() => authStore.getUser);
const file = ref<UserFile>({
  id: "",
  name: "",
  preview: "",
  url: "",
  format: "",
  size: 0,
  createdAt: "",
  lastUpdate: "",
  isFavorite: false,
});

const isFileMenuOpen = ref(false);
const isShareModalOpen = ref(false);
const isRenameModalOpen = ref(false);
const fileNotFound = ref<boolean>(false);
const hasRetriedPreview = ref(false);
const hasRetriedUrl = ref(false);

const fetchFileDetails = async () => {
  showLoadingPage(true);
  hasRetriedPreview.value = false;
  hasRetriedUrl.value = false;
  const cacheStore = useFileCacheStore();
  const fileId = route.params.id as string;

  const hasPreviewCache = cacheStore.hasPreviewCache(fileId);
  const hasUrlCache = cacheStore.hasUrlCache(fileId);

  try {
    const path = getRouteWithPathParams(API_ROUTES.FILE.GET_FILE, {
      [PARAMS.ID]: fileId,
    });
    const { data } = await api.get(path);
    file.value = data.fileResponse;

    const fileSupportsPreview = hasPreview(file.value.format);
    const fileSupportsView = hasView(file.value.format);
    const needsPreview = fileSupportsPreview && !hasPreviewCache;
    const needsUrl = fileSupportsView && !hasUrlCache;

    if (needsPreview && needsUrl) {
      const result = await cacheStore.getOrFetch(fileId, "both");
      file.value.preview = result.preview;
      file.value.url = result.url;
    } else {
      if (needsPreview) {
        const result = await cacheStore.getOrFetch(fileId, "preview");
        file.value.preview = result.preview;
      } else if (fileSupportsPreview) {
        file.value.preview = cacheStore.getPreviewCache(fileId);
      }

      if (needsUrl) {
        const result = await cacheStore.getOrFetch(fileId, "url");
        file.value.url = result.url;
      } else if (fileSupportsView) {
        file.value.url = cacheStore.getUrlCache(fileId);
      }
    }
  } catch (error: any) {
    console.error("Erro ao buscar detalhes do arquivo:", error);
    if (error.response?.status === 404) {
      fileNotFound.value = true;
    } else {
      verifyApiError(error.response?.status);
    }
  } finally {
    showLoadingPage(false);
  }
};

const handleMediaError = async (errorType: "preview" | "url") => {
  const cacheStore = useFileCacheStore();
  const fileId = route.params.id as string;

  if (errorType === "preview" && !hasRetriedPreview.value) {
    hasRetriedPreview.value = true;
    cacheStore.invalidatePreviewCache(fileId);
    try {
      const result = await cacheStore.getOrFetch(fileId, "preview");
      file.value.preview = result.preview;
    } catch (err) {
      console.warn(`Erro no auto-retry de preview para arquivo ${fileId}:`, err);
      showToast("Erro ao carregar o arquivo", "error");
    }
  } else if (errorType === "url" && !hasRetriedUrl.value) {
    hasRetriedUrl.value = true;
    cacheStore.invalidateUrlCache(fileId);
    try {
      const result = await cacheStore.getOrFetch(fileId, "url");
      file.value.url = result.url;
    } catch (err) {
      console.warn(`Erro no auto-retry de url para arquivo ${fileId}:`, err);
      showToast("Erro ao carregar o arquivo", "error");
    }
  } else {
    showToast("Erro ao carregar o arquivo", "error");
  }
};

onMounted(() => {
  fetchFileDetails();
  window.addEventListener("click", closeFileMenu);
});

onUnmounted(() => {
  window.removeEventListener("click", closeFileMenu);
});

const toggleFileMenu = (event: Event) => {
  event.stopPropagation();
  isFileMenuOpen.value = !isFileMenuOpen.value;
};

const closeFileMenu = () => {
  isFileMenuOpen.value = false;
};

const handleDownload = () => {
  downloadFile(file.value.id);
  isFileMenuOpen.value = false;
};

const handleShareClick = () => {
  isShareModalOpen.value = true;
  isFileMenuOpen.value = false;
};

const handleRenameClick = () => {
  isRenameModalOpen.value = true;
  isFileMenuOpen.value = false;
};

const handleToggleFavorite = async () => {
  await toggleFavorite(file.value.id, !file.value.isFavorite);

  file.value.isFavorite = !file.value.isFavorite;
  isFileMenuOpen.value = false;
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: "myFiles" });
  }
};

const handleRenameSuccess = (newName: string) => {
  file.value.name = newName;
};
</script>

<template>
  <MainPageTemplate>
    <div
      class="w-screen h-screen flex flex-col bg-[#121212] overflow-hidden text-white font-sans"
    >
      <header
        class="min-h-[70px] sm:h-[80px] py-2 sm:py-0 bg-[#121212] border-b border-white/5 flex items-center justify-between px-3 sm:px-6 shrink-0 relative z-30 gap-2"
      >
        <div class="flex items-center min-w-0 flex-1">
          <button
            @click="goBack"
            class="p-2 rounded-full hover:bg-white/5 mr-2 sm:mr-4 text-gray-400 hover:text-white cursor-pointer transition-colors shrink-0"
            title="Voltar"
          >
            <FontAwesomeIcon :icon="faArrowLeft" class="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <template v-if="!fileNotFound">
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all duration-300"
              :class="getFileBgClass(file.format)"
            >
              <FontAwesomeIcon
                :icon="getFileIcon(file.format)"
                class="text-[#121212] text-sm sm:text-lg"
              />
            </div>

            <div class="ml-2 sm:ml-4 flex flex-col min-w-0 flex-1 pr-2 sm:pr-4">
              <div class="flex items-center gap-1.5 min-w-0">
                <h1
                  class="text-white text-xs sm:text-base font-semibold truncate select-none"
                  :title="file.name"
                >
                  {{ file.name }}
                </h1>
                <FontAwesomeIcon
                  :icon="faFolderOpen"
                  class="mt-1 text-gray-500 text-[10px] sm:text-xs shrink-0 cursor-default hidden sm:inline"
                />
              </div>

              <div class="flex gap-2 mt-0.5 relative">
                <div class="relative">
                  <button
                    @click.stop="toggleFileMenu"
                    class="text-[11px] sm:text-xs text-gray-400 hover:text-white hover:bg-white/5 px-1.5 sm:px-2 py-0.5 rounded transition-all cursor-pointer select-none font-medium flex items-center gap-1"
                    :class="{ 'bg-white/10 text-white': isFileMenuOpen }"
                  >
                    <span>Arquivo</span>
                    <FontAwesomeIcon
                      :icon="faChevronDown"
                      class="text-[8px] sm:text-[9px] transition-transform duration-200"
                      :class="{ 'rotate-180': isFileMenuOpen }"
                    />
                  </button>

                  <Transition name="dropdown-fade">
                    <div
                      v-if="isFileMenuOpen"
                      class="absolute left-0 mt-1.5 w-52 sm:w-60 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1.5 flex flex-col overflow-hidden z-50 text-left"
                    >
                      <button
                        v-if="file.role === 3"
                        @click="handleShareClick"
                        class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon
                          :icon="faShareNodes"
                          class="w-4 h-4 text-gray-400 shrink-0"
                        />
                        <span>Compartilhar</span>
                      </button>

                      <button
                        @click="handleDownload"
                        class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon
                          :icon="faDownload"
                          class="w-4 h-4 text-gray-400 shrink-0"
                        />
                        <span>Baixar</span>
                      </button>

                      <button
                        v-if="file.role && file.role >= 2"
                        @click="handleRenameClick"
                        class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon
                          :icon="faPen"
                          class="w-4 h-4 text-gray-400 shrink-0"
                        />
                        <span>Renomear</span>
                      </button>

                      <div
                        v-if="file.role === 3"
                        class="h-px bg-white/5 my-1"
                      ></div>

                      <button
                        v-if="file.role === 3"
                        @click="handleToggleFavorite"
                        class="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm flex items-center gap-2.5 transition-colors cursor-pointer"
                        :class="
                          file.isFavorite
                            ? 'text-[#fbbf24] hover:bg-[#fbbf24]/5'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        "
                      >
                        <FontAwesomeIcon
                          :icon="file.isFavorite ? faStar : faStarRegular"
                          class="w-4 h-4 shrink-0"
                        />
                        <span class="truncate">{{
                          file.isFavorite
                            ? "Remover favorito"
                            : "Adicionar favorito"
                        }}</span>
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <h1 class="text-white text-xs sm:text-base font-semibold select-none">
              Indisponível
            </h1>
          </template>
        </div>

        <div v-if="!fileNotFound" class="flex items-center shrink-0 gap-2 sm:gap-3">
          <button
            v-if="file.role === 3"
            @click="handleShareClick"
            class="flex items-center gap-1.5 bg-[#009900] hover:bg-[#22c55e] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 shadow-md cursor-pointer active:scale-95"
          >
            <FontAwesomeIcon :icon="faLock" class="text-[10px] sm:text-xs" />
            <span class="hidden sm:inline">Compartilhar</span>
          </button>

          <img
            :src="user?.avatarUrl || UserImage"
            class="rounded-full size-8 sm:size-10 object-cover border border-white/10 shrink-0"
            alt="Avatar"
          />
        </div>
      </header>

      <main
        v-if="fileNotFound"
        class="flex-1 bg-[#161616] m-4 mt-2 rounded-[24px] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden p-6 z-10"
      >
        <div
          class="flex flex-col items-center justify-center text-center gap-6 max-w-md px-6"
        >
          <div
            class="w-32 h-32 rounded-[32px] bg-[#1e1e1e] border border-white/5 flex items-center justify-center"
          >
            <FontAwesomeIcon
              :icon="faFolderOpen"
              class="text-gray-500 text-5xl"
            />
          </div>

          <div class="flex flex-col gap-2">
            <h2 class="text-white text-2xl font-bold">
              Arquivo não encontrado
            </h2>
            <p class="text-gray-400 text-[15px] leading-relaxed">
              O arquivo solicitado não existe ou foi excluído. Verifique o link
              e tente novamente.
            </p>
          </div>

          <button
            @click="router.push({ name: 'myFiles' })"
            class="mt-3 px-6 py-2.5 bg-[#009900] hover:bg-[#22c55e] text-white font-semibold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <span>Ir para Meus Arquivos</span>
          </button>
        </div>
      </main>

      <main
        v-else
        class="flex-1 bg-[#161616] m-4 mt-2 rounded-[24px] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden p-6 z-10"
      >
        <div
          v-if="file.url || file.preview"
          class="w-full h-full flex flex-col items-center justify-center"
        >
          <div
            v-if="isVideo(file.format) && file.format?.toLowerCase() !== 'mkv' && file.format?.toLowerCase() !== 'avi'"
            class="max-w-[1000px] w-full max-h-[75vh] flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10"
          >
            <video
              :src="file.url || undefined"
              controls
              @error="handleMediaError('url')"
              class="w-full max-h-[75vh] object-contain"
            ></video>
          </div>

          <div
            v-else-if="isAudio(file.format)"
            class="max-w-[550px] w-full p-8 bg-[#1e1e1e]/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col items-center gap-6"
          >
            <div
              class="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105"
              :class="getFileBgClass(file.format)"
            >
              <FontAwesomeIcon
                :icon="getFileIcon(file.format)"
                class="text-[#121212] text-3xl"
              />
            </div>

            <div class="text-center min-w-0 w-full px-2">
              <h3 class="text-white text-base font-semibold truncate" :title="file.name">
                {{ file.name }}
              </h3>
              <p class="text-gray-400 text-xs mt-1 font-medium">Arquivo de Áudio</p>
            </div>

            <audio
              :src="file.url || undefined"
              controls
              @error="handleMediaError('url')"
              class="w-full mt-2"
            ></audio>
          </div>

          <div
            v-else-if="isImage(file.format) && file.url"
            class="max-w-[900px] w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black/40 p-2 border border-white/10"
          >
            <img
              :src="file.url || file.preview || undefined"
              @error="file.url ? handleMediaError('url') : handleMediaError('preview')"
              class="max-w-full max-h-[72vh] object-contain rounded-xl"
              alt="Arquivo de imagem"
            />
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center text-center gap-6 max-w-lg px-6"
        >
          <div
            class="w-32 h-32 rounded-[32px] flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 hover:rotate-3"
            :class="getFileBgClass(file.format)"
          >
            <FontAwesomeIcon
              :icon="getFileIcon(file.format)"
              class="text-[#121212] text-6xl"
            />
          </div>

          <div class="flex flex-col gap-2">
            <h2
              class="text-white text-xl font-bold truncate max-w-sm select-all"
            >
              {{ file.name }}
            </h2>
            <p class="text-gray-400 text-sm">
              Nenhuma visualização disponível para arquivos do tipo
              <span class="uppercase font-semibold text-white/80"
                >.{{ file.format }}</span
              >
            </p>
          </div>

          <button
            @click="handleDownload"
            class="mt-3 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center gap-2 hover:border-white/20 active:scale-95"
          >
            <FontAwesomeIcon :icon="faDownload" />
            <span>Baixar Arquivo</span>
          </button>
        </div>
      </main>

      <FileShareModal
        :isOpen="isShareModalOpen"
        :file="file"
        :close="() => (isShareModalOpen = false)"
      />

      <FileRenameModal
        :isOpen="isRenameModalOpen"
        :file="file"
        :isMock="true"
        :close="() => (isRenameModalOpen = false)"
        :success="handleRenameSuccess"
      />
    </div>
  </MainPageTemplate>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
