<script setup lang="ts">
import MainPageTemplate from "../../components/main-page-template.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../../composables/use-toast.ts";
import { useLoading } from "../../composables/use-loading.ts";
import { useFilesServices } from "../../services/files-services.ts";
import FileInfoModal from "../../components/file-info-modal.vue";
import FileCard from "../../components/file-card.vue";
import FileSkeletonLoader from "../../components/file-skeleton-loader.vue";
import { api } from "../../services/api.ts";
import { verifyApiError } from "../../services/verify-api-error.ts";
import { API_ROUTES } from "../../routing/routes";
import type { UserFile } from "../../types/file";

const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const { restoreFile } = useFilesServices();

const searchQuery = ref("");
const isLoadingFiles = ref<boolean>(false);
const selectedFile = ref<UserFile | null>(null);
const isInfoModalOpen = ref(false);
const files = ref<UserFile[]>([]);

const fetchFiles = async () => {
  isLoadingFiles.value = true;
  const { data } = await api.get(`${API_ROUTES.FILE.MY_FILES}?status=TRASH`);
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

const handleRestore = async (file: UserFile) => {
  const originalFiles = [...files.value];
  files.value = files.value.filter((f) => f.id !== file.id);
  openMenuIndex.value = null;

  const success = await restoreFile(file.id);
  if (!success) {
    files.value = originalFiles;
  }
};

const handlePermanentDelete = (file: UserFile) => {
  files.value = files.value.filter((f) => f.id !== file.id);
  showToast("Arquivo excluído permanentemente!", "success");
  openMenuIndex.value = null;
};

const handleInfo = (file: UserFile) => {
  selectedFile.value = file;
  isInfoModalOpen.value = true;
  openMenuIndex.value = null;
};
</script>

<template>
  <MainPageTemplate
    v-model="searchQuery"
    :header="true"
    :sidebar="true"
    title="Lixeira"
  >
    <div class="flex flex-col gap-6 py-6">
      <FileSkeletonLoader v-if="isLoadingFiles" :count="4" />

      <template v-else>
        <div
          v-if="filteredFiles.length === 0"
          class="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4"
        >
          <div
            class="size-30 rounded-full bg-[#1e1e1e] flex items-center justify-center border border-white/5 text-gray-500"
          >
            <FontAwesomeIcon :icon="faTrashCan" class="text-5xl" />
          </div>
          <div>
            <h3 class="text-white text-[20px] font-semibold">
              A lixeira está vazia
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
            :showFavorite="false"
            :isInTrash="true"
            :onToggleMenu="toggleMenu"
            :onInfo="handleInfo"
            :onRestore="handleRestore"
            :onPermanentDelete="handlePermanentDelete"
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
</template>
