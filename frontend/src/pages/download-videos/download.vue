<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import MainPageTemplate from "../../components/main-page-template.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faDownload,
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
  isDownloading.value = true;

  try {
    const response = await api.get("/download-video", {
      params: { source: url.value },
      responseType: "blob",
    });

    if (response.data) {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const title = preview.value?.title || "video";
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `${cleanTitle}.mp4`;

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

      <div class="flex flex-col items-center bg-[#141414]/80 border border-[#222] rounded-[15px] p-8">
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
          <button
            @click="handleDownload"
            :disabled="isDownloading"
            class="text-white px-6 py-3 bg-[#009900] hover:bg-[#22c55e] disabled:bg-green-950/50 disabled:text-gray-500 text-black font-bold text-[14px] rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <FontAwesomeIcon
              :icon="isDownloading ? faSpinner : faDownload"
              :spin="isDownloading"
            />
            <span>{{
              isDownloading ? "Baixando..." : "Baixar"
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>
