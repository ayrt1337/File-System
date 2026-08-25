<script setup lang="ts">
import HomePageTemplate from "../../components/home-page-template.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { api } from "../../services/api";
import { verifyApiError } from "../../services/verify-api-error";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faStar, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useLoading } from "../../composables/use-loading.ts";
import { useFilesServices } from "../../services/files-services.ts";
import FileInfoModal from "../../components/file-info-modal.vue";
import FileRenameModal from "../../components/file-rename-modal.vue";
import FileShareModal from "../../components/file-share-modal.vue";
import FileCard from "../../components/file-card.vue";
import FileSkeletonLoader from "../../components/file-skeleton-loader.vue";
import { API_ROUTES } from "../../routing/routes";
import type { UserFile } from "../../types/file";
import { useInfiniteScroll } from "../../composables/use-infinite-scroll";

const { showLoadingPage } = useLoading();
const { downloadFile, toggleFavorite, deleteFile } = useFilesServices();

const files = ref<UserFile[]>([]);
const searchQuery = ref<string>("");
const isLoadingFiles = ref<boolean>(false);
const isLoadingMore = ref<boolean>(false);
const page = ref<number>(1);
const limit = 30;
const hasMore = ref<boolean>(true);
const totalFiles = ref<number>(0);
const selectedFile = ref<UserFile | null>(null);
const isInfoModalOpen = ref<boolean>(false);
const isRenameModalOpen = ref<boolean>(false);
const isShareModelOpen = ref<boolean>(false);
const sentinelRef = ref<HTMLElement | null>(null);

const fetchFiles = async (reset = false) => {
  if (reset) {
    page.value = 1;
    hasMore.value = true;
    isLoadingFiles.value = true;
  }

  try {
    const { data } = await api.get(
      `${API_ROUTES.FILE.MY_FILES}?status=ACTIVE&isFavorite=true&page=${page.value}&limit=${limit}`,
    );
    const newFiles = data.files || [];
    if (reset) {
      files.value = newFiles;
    } else {
      files.value = [...files.value, ...newFiles];
    }
    hasMore.value = data.hasMore ?? false;
    totalFiles.value = data.total ?? files.value.length;
  } finally {
    if (reset) {
      isLoadingFiles.value = false;
    }
  }
};

const loadMore = async () => {
  if (isLoadingFiles.value || isLoadingMore.value || !hasMore.value) return;

  isLoadingMore.value = true;
  page.value += 1;
  try {
    const { data } = await api.get(
      `${API_ROUTES.FILE.MY_FILES}?status=ACTIVE&isFavorite=true&page=${page.value}&limit=${limit}`,
    );
    const newFiles = data.files || [];
    files.value = [...files.value, ...newFiles];
    hasMore.value = data.hasMore ?? false;
    totalFiles.value = data.total ?? files.value.length;
  } catch (error: any) {
    console.error("Erro ao carregar mais favoritos: ", error);
    page.value -= 1;
  } finally {
    isLoadingMore.value = false;
  }
};

useInfiniteScroll(sentinelRef, loadMore, {
  enabled: () => hasMore.value && !isLoadingFiles.value && !isLoadingMore.value,
});

const loadFiles = async () => {
  showLoadingPage(true);
  try {
    await fetchFiles(true);
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
  isShareModelOpen.value = true;
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
  files.value = files.value.filter((f) => f.id !== file.id);
  openMenuIndex.value = null;

  const success = await toggleFavorite(file.id, false);
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
    title="Favoritos"
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
            <FontAwesomeIcon
              :icon="faStar"
              class="text-3xl sm:text-5xl text-[#fbbf24]"
            />
          </div>
          <div>
            <h3 class="text-white text-base sm:text-[20px] font-semibold">
              Nenhum arquivo favorito
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

        <div
          v-if="files.length !== totalFiles"
          ref="sentinelRef"
          class="w-full flex items-center justify-center py-6 min-h-[48px]"
        >
          <FontAwesomeIcon
            v-if="isLoadingMore"
            :icon="faSpinner"
            class="animate-spin text-2xl text-[#22c55e]"
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
    :success="() => fetchFiles(true)"
  />

  <FileShareModal
    :isOpen="isShareModelOpen"
    :file="selectedFile"
    :close="() => (isShareModelOpen = false)"
  />
</template>
