<script setup lang="ts">
import MainPageTemplate from "../../components/main-page-template.vue";
import { ref, computed, onMounted } from "vue";
import { api } from "../../services/api";
import { verifyApiError } from "../../services/verify-api-error";
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
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useLoading } from "../../composables/use-loading.ts";

const { showLoadingPage } = useLoading();

interface UserFile {
  name: string;
  format: string;
  size: number;
  createdAt: string;
  lastUpdate: string | null;
}

const files = ref<UserFile[]>([]);
const searchQuery = ref("");
const isLoadingFiles = ref<boolean>(false);
const hasProcessingFiles = ref<boolean>(false);
const isWarningDismissed = ref<boolean>(false);

const fetchFiles = async () => {
  isLoadingFiles.value = true;
  const { data } = await api.get(`/my-files`);
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

const getFileColorClass = (format: string) => {
  const fmt = format.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fmt))
    return "text-[#60a5fa]";
  if (["mp4", "webm", "mkv", "avi", "mov"].includes(fmt))
    return "text-[#c084fc]";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(fmt))
    return "text-[#f472b6]";
  if (fmt === "pdf") return "text-[#f87171]"; // Vermelho
  if (["doc", "docx", "odt"].includes(fmt)) return "text-[#38bdf8]"; // Céu
  if (["xls", "xlsx", "csv", "ods"].includes(fmt)) return "text-[#34d399]"; // Esmeralda
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
    return "text-[#fbbf24]";
  return "text-[#9ca3af]";
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
        v-if="hasProcessingFiles && !isWarningDismissed" 
        class="relative bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] rounded-2xl p-4 pr-12 flex items-center gap-3 select-none transition-all duration-300"
      >
        <FontAwesomeIcon :icon="faTriangleExclamation" class="text-[22px] mt-0.5 shrink-0" />
        <div class="flex flex-col gap-0.5">
          <p class="text-[17px] font-semibold text-white">Arquivos em processamento</p>
          <p class="text-[14px] text-[#fbbf24]/80">Um ou mais arquivos estão sendo processados e em breve estarão visíveis na sua listagem.</p>
        </div>
        <button 
          @click="isWarningDismissed = true" 
          class="absolute top-1/2 -translate-y-1/2 right-4 text-[#fbbf24]/60 hover:text-[#fbbf24] transition-colors p-1.5 hover:bg-[#fbbf24]/10 rounded-lg cursor-pointer"
        >
          <FontAwesomeIcon :icon="faXmark" class="h-4 w-4" />
        </button>
      </div>

      <div
        v-if="isLoadingFiles"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="n in 8"
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
          <div
            v-for="(file, index) in filteredFiles"
            :key="index"
            class="cursor-pointer bg-[#1e1e1e]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-44 group cursor-default"
          >
            <div class="flex items-center justify-between">
              <div
                class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5"
              >
                <FontAwesomeIcon
                  :icon="getFileIcon(file.format)"
                  :class="[getFileColorClass(file.format), 'text-lg']"
                />
              </div>
              <span
                class="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5"
              >
                {{ file.format }}
              </span>
            </div>

            <div class="my-4">
              <h4
                class="text-white font-medium text-base truncate group-hover:text-[#00c800] transition-colors duration-300"
                :title="file.name"
              >
                {{ file.name }}
              </h4>
            </div>

            <div
              class="flex items-center justify-between text-xs text-gray-400 font-medium"
            >
              <span>{{ formatSize(file.size) }}</span>
              <span class="text-gray-500">{{
                formatDate(file.createdAt)
              }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainPageTemplate>
</template>
