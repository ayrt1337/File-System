<script setup lang="ts">
import HomePageTemplate from "../../components/home-page-template.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faTrashCan,
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
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
import Overlay from "../../components/overlay.vue";
import { useFileCacheStore } from "../../stores/file-cache";

const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const { restoreFile, deletePermanentFile } = useFilesServices();
const fileCacheStore = useFileCacheStore();

const searchQuery = ref("");
const isLoadingFiles = ref<boolean>(false);
const selectedFile = ref<UserFile | null>(null);
const isInfoModalOpen = ref(false);
const files = ref<UserFile[]>([]);

const showDeleteConfirm = ref<boolean>(false);
const fileToDelete = ref<UserFile | null>(null);
const inputLoading = ref<boolean>(false);

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
  fileToDelete.value = file;
  showDeleteConfirm.value = true;
  openMenuIndex.value = null;
};

const confirmDelete = async () => {
  if (!fileToDelete.value) return;
  inputLoading.value = true;

  const fileId = fileToDelete.value.id;
  const success = await deletePermanentFile(fileId);

  if (success) {
    fileCacheStore.invalidateFileCache(fileId);
    files.value = files.value.filter((f) => f.id !== fileId);
    showToast("Arquivo excluído permanentemente!", "success");
  } else {
    showToast("Erro ao excluir o arquivo permanentemente.", "error");
  }

  inputLoading.value = false;
  showDeleteConfirm.value = false;
  fileToDelete.value = null;
};

const handleInfo = (file: UserFile) => {
  selectedFile.value = file;
  isInfoModalOpen.value = true;
  openMenuIndex.value = null;
};
</script>

<template>
  <HomePageTemplate
    v-model="searchQuery"
    :header="true"
    :sidebar="true"
    title="Lixeira"
  >
    <div class="flex flex-col gap-6 py-6">
      <div
        class="relative bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] rounded-2xl p-4 flex items-center gap-3 select-none transition-all duration-300"
      >
        <FontAwesomeIcon
          :icon="faTriangleExclamation"
          class="text-[22px] mt-0.5 shrink-0"
        />
        <div class="flex flex-col gap-0.5">
          <p class="text-[17px] font-semibold text-white">
            Limpeza Automática
          </p>
          <p class="text-[14px] text-[#fbbf24]/80">
            Os arquivos que permanecerem na lixeira por mais de 30 dias serão excluídos permanentemente de forma automática.
          </p>
        </div>
      </div>

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
            :redirect="false"
            :onToggleMenu="toggleMenu"
            :onInfo="handleInfo"
            :onRestore="handleRestore"
            :onPermanentDelete="handlePermanentDelete"
          />
        </div>
      </template>
    </div>
  </HomePageTemplate>
  <FileInfoModal
    :isOpen="isInfoModalOpen"
    :file="selectedFile"
    :close="() => isInfoModalOpen = false"
  />

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

          <h3 class="text-xl font-bold text-white mb-2">Excluir permanentemente?</h3>
          <p class="text-gray-400 text-sm leading-relaxed mb-8">
            Esta ação é permanente e o arquivo não poderá ser recuperado.
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
              <FontAwesomeIcon v-if="inputLoading" :icon="faSpinner" spin class="mr-2" />
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Overlay>
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
