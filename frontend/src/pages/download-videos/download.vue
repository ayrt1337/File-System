<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MainPageTemplate from "../../components/main-page-template.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faDownload,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  faYoutube,
  faXTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { getPreview } from "../../services/get-preview-from-oembed";
import { useToast } from "../../composables/use-toast";
import { api } from "../../services/api";
import type { Preview } from "../../types/video-preview.ts";
import Input from "../../components/input.vue";
import { API_ROUTES } from "../../routing/routes";
import axios from "axios";
import { getFilePreview } from "../../utils/get-file-preview";

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();

const platform = computed(() => (route.query.source as string) || "youtube");

const platformName = computed(() => {
  switch (platform.value) {
    case "youtube":
      return "YouTube";
    case "instagram":
      return "Instagram";
    case "x":
    case "twitter":
      return "X (Twitter)";
    default:
      return "Vídeo";
  }
});

const platformIcon = computed(() => {
  switch (platform.value) {
    case "youtube":
      return faYoutube;
    case "instagram":
      return faInstagram;
    case "x":
    case "twitter":
      return faXTwitter;
    default:
      return null;
  }
});

const platformColorClass = computed(() => {
  switch (platform.value) {
    case "youtube":
      return "text-red-500";
    case "instagram":
      return "text-pink-500";
    case "x":
    case "twitter":
      return "text-white";
    default:
      return "text-blue-500";
  }
});

const url = ref("");
const preview = ref<Preview | null>(null);
const isLoadingPreview = ref(false);
const isDownloading = ref(false);
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

interface DownloadOption {
  format: string;
  quality?: string;
  formatName: string;
  resolution: string;
  type: string;
}

const downloadOptionsList: DownloadOption[] = [
  {
    format: "mp4",
    quality: "1080p",
    formatName: "MP4 Widescreen",
    resolution: "1080p",
    type: "VÍDEO",
  },
  {
    format: "mp4",
    quality: "720p",
    formatName: "MP4 Widescreen",
    resolution: "720p",
    type: "VÍDEO",
  },
  {
    format: "mp4",
    quality: "480p",
    formatName: "MP4 Widescreen",
    resolution: "480p",
    type: "VÍDEO",
  },
  {
    format: "mp4",
    quality: "360p",
    formatName: "MP4 Widescreen",
    resolution: "360p",
    type: "VÍDEO",
  },
  {
    format: "mp3",
    formatName: "Áudio MP3",
    resolution: "Estéreo",
    type: "ÁUDIO",
  },
];

const selectedOption = ref<DownloadOption>(downloadOptionsList[3]!);
watch(
  () => preview.value,
  () => (selectedOption.value = downloadOptionsList[3]!),
);

const selectOption = (opt: DownloadOption) => {
  selectedOption.value = opt;
  isOpen.value = false;
};

const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});

const handleFetchPreview = async () => {
  if (!url.value) {
    showToast("Por favor, insira uma URL válida!", "error");
    return;
  }

  isLoadingPreview.value = true;
  preview.value = null;

  try {
    const result = (await getPreview(platform.value, url.value)) as Preview;
    if (result) {
      preview.value = result;
    } else {
      showToast(
        "Não foi possível carregar a prévia. Verifique se o link corresponde à plataforma selecionada.",
        "error",
      );
    }
  } catch (error) {
    console.error("Erro ao carregar prévia:", error);
    showToast("Erro ao carregar a prévia do vídeo.", "error");
  } finally {
    isLoadingPreview.value = false;
  }
};

const handleDownload = async () => {
  if (!url.value) return;
  const option = selectedOption.value;
  isDownloading.value = true;
  isOpen.value = false;

  try {
    const response = await api.get(API_ROUTES.FILE.DOWNLOAD_VIDEO, {
      params: {
        source: url.value,
        format: option.format,
        quality: option.quality,
      },
      responseType: "blob",
    });

    if (response.data) {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const title = preview.value?.title || "video";
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `${cleanTitle}.${option.format}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      showToast("Download iniciado com sucesso!", "success");
    } else {
      showToast("Erro ao processar download no servidor.", "error");
    }
  } catch (error) {
    console.error("Erro no download:", error);
    showToast("Erro ao iniciar o download. Tente novamente.", "error");
  } finally {
    isDownloading.value = false;
  }
};

const handleSaveFile = async () => {
  if (!url.value) return;
  const option = selectedOption.value;
  isDownloading.value = true;
  isOpen.value = false;

  try {
    const response = await api.get(API_ROUTES.FILE.DOWNLOAD_VIDEO, {
      params: {
        source: url.value,
        format: option.format,
        quality: option.quality,
      },
      responseType: "blob",
    });

    if (response.data) {
      const title = preview.value?.title || "video";
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${cleanTitle}.${option.format}`;
      const contentType = response.data.type || `video/${option.format}`;
      const file = new File([response.data], fileName, { type: contentType });

      const filePreview = await getFilePreview(file);
      const { data } = await api.post(API_ROUTES.FILE.UPLOAD_URL, {
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        preview: filePreview,
      });

      await axios.put(data.url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      showToast("Arquivo salvo com sucesso!", "success");
    }
  } catch (error) {
    console.error("Erro no download:", error);
    showToast("Erro ao salvar o arquivo. Tente novamente.", "error");
  } finally {
    isDownloading.value = false;
  }
};
</script>

<template>
  <MainPageTemplate
    :search-input="false"
    :header="true"
    :sidebar="true"
    title="Baixar Vídeos"
  >
    <div class="max-w-3xl mx-auto text-white mt-10">
      <div class="flex items-center gap-4 mb-8">
        <button
          @click="router.push('/download-videos')"
          class="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#141414] hover:bg-[#222] transition-colors text-gray-400 hover:text-white cursor-pointer"
        >
          <FontAwesomeIcon :icon="faArrowLeft" />
        </button>
        <div>
          <h2
            class="text-xl font-bold text-white leading-none flex items-center gap-2"
          >
            <span :class="platformColorClass">
              <FontAwesomeIcon v-if="platformIcon" :icon="platformIcon" />
            </span>
            Baixar do {{ platformName }}
          </h2>
          <p class="text-[15px] text-gray-500 mt-2">
            Insira a URL do vídeo do {{ platformName }} que deseja baixar.
          </p>
        </div>
      </div>

      <div
        class="flex flex-col items-center bg-[#141414]/80 border border-[#222] rounded-[15px] p-8"
      >
        <div class="w-full flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <Input
              v-model="url"
              text="Link do vídeo"
              :on-key-enter="!isLoadingPreview ? handleFetchPreview : undefined"
              left-icon="faVideo"
            />
          </div>
          <button
            @click="handleFetchPreview"
            :disabled="isLoadingPreview || isDownloading"
            class="disabled:cursor-not-allowed px-6 py-2 bg-[#009900] hover:bg-[#22c55e] disabled:opacity-70 text-white font-bold text-[15px] rounded-full tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Baixar</span>
          </button>
        </div>

        <div
          v-if="isLoadingPreview"
          class="mt-8 py-10 flex flex-col items-center justify-center"
        >
          <FontAwesomeIcon
            :icon="faSpinner"
            class="text-3xl text-emerald-500 animate-spin"
          />
          <p class="text-sm text-gray-500 mt-3">
            Buscando informações do vídeo...
          </p>
        </div>

        <div
          v-else-if="preview"
          class="mt-8 border border-gray-800 bg-[#1a1a1a]/40 rounded-[15px] p-6 transition-all duration-300"
        >
          <div
            class="flex flex-col md:flex-row gap-5 items-center md:items-start"
          >
            <div
              v-if="preview.thumbnail"
              class="w-full md:w-56 shrink-0 aspect-video rounded-[15px] overflow-hidden shadow-lg border border-[#2c2c2c] relative bg-black/40 flex items-center justify-center"
            >
              <img
                :src="preview.thumbnail"
                alt="Video Thumbnail"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h3
                  class="font-bold text-white text-lg md:text-xl leading-snug line-clamp-3 mb-2 tracking-wide"
                >
                  {{ preview.title }}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div v-if="preview" class="mt-6 flex flex-wrap gap-3">
          <div ref="dropdownRef" class="relative inline-flex items-stretch">
            <div class="flex flex-col items-center gap-3">
              <div class="flex">
                <button
                  @click="handleDownload()"
                  :disabled="isDownloading"
                  class="disabled:cursor-not-allowed text-white px-6 py-3 bg-[#009900] hover:bg-[#22c55e] disabled:bg-green-950/50 disabled:text-gray-500 font-bold text-[14px] rounded-l-full border-r border-[#008000]/30 transition-all duration-300 flex items-center gap-2 cursor-pointer select-none"
                >
                  <FontAwesomeIcon
                    :icon="isDownloading ? faSpinner : faDownload"
                    :spin="isDownloading"
                  />
                  <span>{{ isDownloading ? "Baixando..." : "Baixar" }}</span>
                </button>

                <button
                  @click="isOpen = !isOpen"
                  :disabled="isDownloading"
                  class="disabled:cursor-not-allowed bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 text-[#009900] font-bold text-[14px] px-4 py-3 rounded-r-full flex items-center gap-2 cursor-pointer transition-all duration-300 select-none min-w-[110px] justify-between"
                >
                  <span class="truncate"
                    >{{ selectedOption.format.toUpperCase() }}
                    {{ selectedOption.quality || "" }}</span
                  >
                  <FontAwesomeIcon
                    :icon="faChevronDown"
                    class="text-[11px] shrink-0"
                  />
                </button>
              </div>

              <p
                @click="!isDownloading ? handleSaveFile() : null"
                class="underline text-[#009900] cursor-pointer"
              >
                Salvar Arquivo
              </p>
            </div>

            <transition name="fade">
              <div
                v-if="isOpen"
                class="overflow-y-auto h-[200px] absolute right-0 top-full mt-2 w-64 rounded-[15px] bg-[#1a1a1a] border border-gray-800 py-2 z-50"
              >
                <button
                  v-for="opt in downloadOptionsList"
                  :key="opt.resolution + opt.format"
                  @click="selectOption(opt)"
                  class="w-full text-left px-4 py-3 hover:bg-[#222] transition-colors flex items-center justify-between text-gray-200 hover:text-white cursor-pointer"
                >
                  <div class="flex flex-col">
                    <span class="font-bold text-[14px]">{{
                      opt.formatName
                    }}</span>
                    <span class="text-xs text-gray-500">{{
                      opt.resolution
                    }}</span>
                  </div>
                  <span
                    class="text-[10px] font-bold text-[#009900] bg-[#009900]/10 border border-[#009900]/20 px-2 py-0.5 rounded-full"
                  >
                    {{ opt.type }}
                  </span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>
