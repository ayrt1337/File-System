<script setup lang="ts">
import MainPageTemplate from "../../components/main-page-template.vue";
import Overlay from "../../components/overlay.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faFile,
  faFileImage,
  faFileVideo,
  faFileAudio,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileCode,
  faXmark,
  faEllipsis,
  faCircleInfo,
  faTrashCan,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../../composables/use-toast.ts";
import { useLoading } from "../../composables/use-loading.ts";
import { api } from "../../services/api.ts";
import { verifyApiError } from "../../services/verify-api-error.ts";

const { showToast } = useToast();
const { showLoadingPage } = useLoading();

interface UserFile {
  id: string;
  name: string;
  preview?: string | null;
  format: string;
  size: number;
  createdAt: string;
  lastUpdate: string | null;
}

const searchQuery = ref("");
const isLoadingFiles = ref<boolean>(false);
const selectedFile = ref<UserFile | null>(null);
const isInfoModalOpen = ref(false);
const files = ref<UserFile[]>([]);

const fetchFiles = async () => {
  isLoadingFiles.value = true;
  const { data } = await api.get(`/my-files?status=TRASH`);
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

const getFileIcon = (format: string) => {
  const fmt = format.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fmt))
    return faFileImage;
  if (["mp4", "webm", "mkv", "avi", "mov"].includes(fmt)) return faFileVideo;
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(fmt)) return faFileAudio;
  if (fmt === "pdf") return faFilePdf;
  if (["doc", "docx", "odt"].includes(fmt)) return faFileWord;
  if (["xls", "xlsx", "csv", "ods"].includes(fmt)) return faFileExcel;
  if (
    [
      "js",
      "ts",
      "html",
      "css",
      "json",
      "py",
      "go",
      "cpp",
      "c",
      "sh",
      "yml",
      "yaml",
    ].includes(fmt)
  )
    return faFileCode;
  return faFile;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getFileBgClass = (format: string) => {
  const fmt = format.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fmt)) return "bg-[#60a5fa]";
  if (["mp4", "webm", "mkv", "avi", "mov"].includes(fmt)) return "bg-[#c084fc]";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(fmt)) return "bg-[#f472b6]";
  if (fmt === "pdf") return "bg-[#f87171]";
  if (["doc", "docx", "odt"].includes(fmt)) return "bg-[#38bdf8]";
  if (["xls", "xlsx", "csv", "ods"].includes(fmt)) return "bg-[#34d399]";
  if (
    [
      "js",
      "ts",
      "html",
      "css",
      "json",
      "py",
      "go",
      "cpp",
      "c",
      "sh",
      "yml",
      "yaml",
    ].includes(fmt)
  )
    return "bg-[#fbbf24]";
  return "bg-[#9ca3af]";
};

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
  showToast("Arquivo restaurado com sucesso!", "success");
  openMenuIndex.value = null;

  try {
    await api.patch("/files/status", { fileId: file.id, status: "ACTIVE" });
  } catch (error: any) {
    console.error("Erro ao restaurar arquivo:", error);
    files.value = originalFiles;
    showToast(
      error.response?.data?.message || "Erro ao restaurar o arquivo.",
      "error"
    );
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
      <div
        v-if="isLoadingFiles"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="n in 4"
          :key="n"
          class="bg-[#1e1e1e]/40 border border-white/5 rounded-2xl p-5 h-44 animate-pulse flex flex-col justify-between"
        >
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 bg-white/5 rounded-lg"></div>
            <div class="w-12 h-6 bg-white/5 rounded-md"></div>
          </div>
          <div class="h-5 bg-white/5 rounded w-3/4 my-4"></div>
          <div class="flex items-center justify-between">
            <div class="h-4 bg-white/5 rounded w-1/4"></div>
            <div class="h-4 bg-white/5 rounded w-1/3"></div>
          </div>
        </div>
      </div>

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
          <div
            v-for="(file, index) in filteredFiles"
            :key="file.id"
            class="relative flex flex-col gap-3 h-64 p-4 bg-[#1e1e1e]/60 backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 group cursor-default"
          >
            <div class="flex items-center justify-between w-full min-w-0 gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <div class="w-6 h-6 rounded-md flex items-center justify-center shrink-0" :class="getFileBgClass(file.format)">
                  <FontAwesomeIcon
                    :icon="getFileIcon(file.format)"
                    class="text-xs text-[#121212]"
                  />
                </div>
                <h4 class="text-white text-sm font-medium truncate select-none" :title="file.name">
                  {{ file.name }}
                </h4>
              </div>
              <button 
                @click.stop="toggleMenu(index)" 
                class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer shrink-0 transition-colors"
              >
                <FontAwesomeIcon :icon="faEllipsis" class="h-4 w-4" />
              </button>
            </div>

            <div class="flex-1 bg-[#121212]/80 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
              <img 
                v-if="file.preview" 
                :src="file.preview" 
                class="w-full h-full object-cover" 
                alt="File preview"
              />
              <div 
                v-else
                class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
                :class="getFileBgClass(file.format)"
              >
                <FontAwesomeIcon
                  :icon="getFileIcon(file.format)"
                  class="text-3xl text-[#121212]"
                />
              </div>
            </div>

            <div 
              v-if="openMenuIndex === index" 
              class="absolute right-4 top-12 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-40 py-1.5 flex flex-col overflow-hidden"
            >
              <button 
                @click.stop="handleRestore(file)" 
                class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon :icon="faRotateLeft" class="w-4 h-4 text-gray-400" />
                <span>Restaurar</span>
              </button>
              
              <button 
                @click.stop="handleInfo(file)" 
                class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon :icon="faCircleInfo" class="w-4 h-4 text-gray-400" />
                <span>Informações</span>
              </button>
              
              <div class="h-px bg-white/5 my-1"></div>
              
              <button 
                @click.stop="handlePermanentDelete(file)" 
                class="w-full px-4 py-2 text-left text-sm text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon :icon="faTrashCan" class="w-4 h-4" />
                <span>Excluir permanentemente</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainPageTemplate>

  <Overlay v-if="isInfoModalOpen && selectedFile">
    <div class="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-[550px] p-6 relative">
      <button 
        @click="isInfoModalOpen = false" 
        class="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer p-1.5 hover:bg-white/5 rounded-lg transition-colors"
      >
        <FontAwesomeIcon :icon="faXmark" class="w-4 h-4" />
      </button>
      
      <h3 class="text-white text-lg font-semibold mb-6">Informações do Arquivo</h3>
      
      <div class="flex flex-col gap-5">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shrink-0" :class="getFileBgClass(selectedFile.format)">
            <FontAwesomeIcon 
              :icon="getFileIcon(selectedFile.format)" 
              class="text-2xl text-[#121212]" 
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-white font-medium text-base break-words" :title="selectedFile.name">
              {{ selectedFile.name }}
            </p>
            <p class="text-gray-400 text-xs uppercase tracking-wider mt-0.5">
              {{ selectedFile.format }}
            </p>
          </div>
        </div>
        
        <div class="h-px bg-white/5"></div>
        
        <div class="flex flex-col gap-3.5 text-sm">
          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-normal">Tamanho</span>
            <span class="text-white font-medium">{{ formatSize(selectedFile.size) }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-normal">Data de Envio</span>
            <span class="text-white font-medium">{{ formatDate(selectedFile.createdAt) }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-normal">Última Modificação</span>
            <span class="text-white font-medium">
              {{ selectedFile.lastUpdate ? formatDate(selectedFile.lastUpdate) : "Nenhuma" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Overlay>
</template>
