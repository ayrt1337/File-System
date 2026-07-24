<script setup lang="ts">
import MainPageTemplate from "../../components/main-page-template.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { api } from "../../services/api";
import { verifyApiError } from "../../services/verify-api-error";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faTriangleExclamation,
  faXmark,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import { useLoading } from "../../composables/use-loading.ts";
import FileInfoModal from "../../components/file-info-modal.vue";
import FileRenameModal from "../../components/file-rename-modal.vue";
import FileCard from "../../components/file-card.vue";
import FileSkeletonLoader from "../../components/file-skeleton-loader.vue";
import { API_ROUTES } from "../../routing/routes";
import type { UserFile } from "../../types/file";
import { useFilesServices } from "../../services/files-services.ts";
import FileShareModal from "../../components/file-share-modal.vue";

const { showLoadingPage } = useLoading();
const { downloadFile, toggleFavorite, deleteFile } = useFilesServices();

const files = ref<UserFile[]>([]);
const searchQuery = ref("");
const isLoadingFiles = ref<boolean>(false);
const hasProcessingFiles = ref<boolean>(false);
const selectedFile = ref<UserFile | null>(null);

const fetchFiles = async () => {
  isLoadingFiles.value = true;
  const { data } = await api.get(`${API_ROUTES.FILE.MY_FILES}?status=ACTIVE`);
  files.value = data.files || [];
  hasProcessingFiles.value = data.hasProcessingFiles || false;
  isLoadingFiles.value = false;
};

const loadFiles = async () => {
  showLoadingPage(true);
  try {
    await fetchFiles();
  } catch (error: any) {
    console.error("Erro em iniciar página: ", error);
    verifyApiError(error.response?.status);
  } finally {
    showLoadingPage(false);
  }
};

onMounted(() => {
  loadFiles();
});

const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value;
  const q = searchQuery.value.toLowerCase();
  return files.value.filter((file) => file.name.toLowerCase().includes(q));
});

const openMenuIndex = ref<number | null>(null);
const isInfoModalOpen = ref<boolean>(false);
const isRenameModalOpen = ref<boolean>(false);
const isShareModalOpen = ref<boolean>(false);

const toggleMenu = (index: number) => {
  if (openMenuIndex.value === index) {
    openMenuIndex.value = null;
  } else {
    openMenuIndex.value = index;
  }
};

const closeMenu = () => {
  openMenuIndex.value = null;
};

onMounted(() => {
  window.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  window.removeEventListener("click", closeMenu);
});

const handleDownload = (file: UserFile) => {
  downloadFile(file.id);
  openMenuIndex.value = null;
};

const handleShare = (file: UserFile) => {
  selectedFile.value = file;
  isShareModalOpen.value = true;
  openMenuIndex.value = null;
};

const handleInfo = (file: UserFile) => {
  selectedFile.value = file;
  isInfoModalOpen.value = true;
  openMenuIndex.value = null;
};

const handleDelete = async (file: UserFile) => {
  const originalFiles = [...files.value];
  files.value = files.value.filter((f) => f.id !== file.id);
  openMenuIndex.value = null;

  const success = await deleteFile(file.id);
  if (!success) {
    files.value = originalFiles;
  }
};

const handleToggleFavorite = async (file: UserFile) => {
  const originalFiles = files.value.map((f) => ({ ...f }));
  file.isFavorite = !file.isFavorite;

  const success = await toggleFavorite(file.id, file.isFavorite);
  if (!success) {
    files.value = originalFiles;
  }
};

const handleRenameClick = (file: UserFile) => {
  selectedFile.value = file;
  isRenameModalOpen.value = true;
  openMenuIndex.value = null;
};
</script>

<template>
  <MainPageTemplate
    v-model="searchQuery"
    :get-files="fetchFiles"
    :header="true"
    :sidebar="true"
    title="Meus Arquivos"
  >
    <div class="flex flex-col gap-6 py-6">
      <div
        v-if="hasProcessingFiles"
        class="relative bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] rounded-2xl p-4 pr-12 flex items-center gap-3 select-none transition-all duration-300"
      >
        <FontAwesomeIcon
          :icon="faTriangleExclamation"
          class="text-[22px] mt-0.5 shrink-0"
        />
        <div class="flex flex-col gap-0.5">
          <p class="text-[17px] font-semibold text-white">
            Arquivos em processamento
          </p>
          <p class="text-[14px] text-[#fbbf24]/80">
            Um ou mais arquivos estão sendo processados e em breve estarão
            visíveis na sua listagem.
          </p>
        </div>
        <button
          @click="hasProcessingFiles = false"
          class="absolute top-1/2 -translate-y-1/2 right-4 text-[#fbbf24]/60 hover:text-[#fbbf24] transition-colors p-1.5 hover:bg-[#fbbf24]/10 rounded-lg cursor-pointer"
        >
          <FontAwesomeIcon :icon="faXmark" class="h-4 w-4" />
        </button>
      </div>

      <FileSkeletonLoader v-if="isLoadingFiles" :count="8" />

      <template v-else>
        <div
          v-if="filteredFiles.length === 0"
          class="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4"
        >
          <div
            class="size-30 rounded-full bg-[#1e1e1e] flex items-center justify-center border border-white/5 text-gray-500"
          >
            <FontAwesomeIcon :icon="faFile" class="text-5xl" />
          </div>
          <div>
            <h3 class="text-white text-[20px] font-semibold">
              Nenhum arquivo encontrado
            </h3>
          </div>
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <FileCard
            v-for="(file, index) in filteredFiles"
            :key="file.id"
            :file="file"
            :index="index"
            :openMenuIndex="openMenuIndex"
            :onToggleFavorite="handleToggleFavorite"
            :onToggleMenu="toggleMenu"
            :onDownload="handleDownload"
            :onRename="handleRenameClick"
            :onShare="handleShare"
            :onInfo="handleInfo"
            :onDelete="handleDelete"
          />
        </div>
      </template>
    </div>
  </MainPageTemplate>

  <FileInfoModal
    :isOpen="isInfoModalOpen"
    :file="selectedFile"
    :close="() => isInfoModalOpen = false"
  />

  <FileRenameModal
    :isOpen="isRenameModalOpen"
    :file="selectedFile"
    :close="() => isRenameModalOpen = false"
    :success="fetchFiles"
  />

  <FileShareModal 
    :isOpen="isShareModalOpen"
    :file="selectedFile"
    :close="() => isShareModalOpen = false"
  />
</template>
