<script setup lang="ts">
import HomePageTemplate from "../../components/home-page-template.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { api } from "../../services/api";
import { verifyApiError } from "../../services/verify-api-error";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
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
const selectedFile = ref<UserFile | null>(null);

const fetchFiles = async () => {
  isLoadingFiles.value = true;
  const { data } = await api.get(API_ROUTES.FILE.SHARED_FILES);
  files.value = data.files || [];
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
  <HomePageTemplate
    v-model="searchQuery"
    :header="true"
    :sidebar="true"
    title="Compartilhados Comigo"
  >
    <div class="flex flex-col gap-4 sm:gap-6 py-3 sm:py-6">
      <FileSkeletonLoader v-if="isLoadingFiles" :count="8" />

      <template v-else>
        <div
          v-if="filteredFiles.length === 0"
          class="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center gap-3 sm:gap-4 px-2"
        >
          <div
            class="size-24 sm:size-30 rounded-full bg-[#1e1e1e] flex items-center justify-center border border-white/5 text-gray-500"
          >
            <FontAwesomeIcon :icon="faFile" class="text-3xl sm:text-5xl" />
          </div>
          <div>
            <h3 class="text-white text-base sm:text-[20px] font-semibold">
              Nenhum arquivo compartilhado
            </h3>
          </div>
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
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
  </HomePageTemplate>

  <FileInfoModal
    :isOpen="isInfoModalOpen"
    :file="selectedFile"
    :close="() => (isInfoModalOpen = false)"
  />

  <FileRenameModal
    :isOpen="isRenameModalOpen"
    :file="selectedFile"
    :close="() => (isRenameModalOpen = false)"
    :success="fetchFiles"
  />

  <FileShareModal
    :isOpen="isShareModalOpen"
    :file="selectedFile"
    :close="() => (isShareModalOpen = false)"
  />
</template>
