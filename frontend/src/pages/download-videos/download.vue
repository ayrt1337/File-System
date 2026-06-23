<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import MainPageTemplate from "../../components/main-page-template.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faCircleInfo,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { faYoutube, faXTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { getPreview } from "../../services/get-preview-from-oembed";
import { useToast } from "../../composables/use-toast";
import { api } from "../../services/api";
import type { Preview } from "../../types/video-preview.ts";

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
const preview = ref<Partial<Preview>>({});
const isLoadingPreview = ref(false);
const isDownloading = ref(false);

const handleFetchPreview = async () => {
  if (!url.value) {
    showToast("Por favor, insira uma URL válida!", "error");
    return;
  }

  // Normalização de URLs do YouTube (ex: converter youtu.be para formato padrão para o oEmbed)
  // let normalizedUrl = url.value.trim();
  // if (platform.value === "youtube" && normalizedUrl.includes("youtu.be/")) {
  //   const videoId = normalizedUrl.split("youtu.be/")[1]?.split(/[?#]/)[0];
  //   if (videoId) {
  //     normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
  //   }
  // } else if (
  //   (platform.value === "x" || platform.value === "twitter") &&
  //   normalizedUrl.includes("twitter.com/")
  // ) {
  //   normalizedUrl = normalizedUrl.replace("twitter.com/", "x.com/");
  // }

  isLoadingPreview.value = true;
  preview.value = {};

  try {
    const result = await getPreview(platform.value, url.value) as Preview;
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
  <MainPageTemplate :search-input="false" :header="true" :sidebar="true" title="Baixar Vídeos">
    <div class="max-w-3xl mx-auto text-white mt-10">
      <div class="flex items-center gap-4 mb-8">
        <button
          @click="router.push('/download-videos')"
          class="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#141414] hover:bg-[#222] transition-colors text-gray-400 hover:text-white cursor-pointer"
        >
          <FontAwesomeIcon :icon="faArrowLeft" />
        </button>
        <div>
          <h2 class="text-xl font-bold text-white leading-none flex items-center gap-2">
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

      <div class="bg-[#141414]/80 border border-[#222] rounded-3xl p-8 shadow-xl">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <input
              v-model="url"
              type="text"
              placeholder="Insira a URL do conteúdo aqui..."
              class="w-full py-4 px-6 bg-white text-black font-medium text-[15px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              @keydown.enter="handleFetchPreview"
            />
          </div>
          <button
            @click="handleFetchPreview"
            :disabled="isLoadingPreview"
            class="px-8 py-4 bg-[#007bff] hover:bg-[#0056b3] disabled:bg-blue-800/50 text-white font-bold text-[15px] rounded-lg tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <FontAwesomeIcon v-if="isLoadingPreview" :icon="faSpinner" spin />
            <span>BAIXAR</span>
          </button>
        </div>

        <p
          class="text-[13px] text-gray-400 mt-5 text-center flex items-center justify-center gap-2 leading-relaxed"
        >
          <span>
            Certifique-se de não violar os direitos de terceiros com os arquivos que baixar.<br />
            Músicas protegidas por direitos autorais não podem ser baixadas com esta ferramenta.
          </span>
          <FontAwesomeIcon :icon="faCircleInfo" class="text-gray-500 text-sm" />
        </p>

        <div v-if="isLoadingPreview" class="mt-8 py-10 flex flex-col items-center justify-center">
          <FontAwesomeIcon :icon="faSpinner" class="text-3xl text-blue-500 animate-spin" />
          <p class="text-sm text-gray-500 mt-3">Buscando informações do vídeo...</p>
        </div>

        <div
          v-else-if="preview"
          class="mt-8 border border-[#222] bg-[#1a1a1a]/40 rounded-2xl p-6 transition-all duration-300 hover:border-[#333]"
        >
          <div class="flex flex-col md:flex-row gap-5 items-center md:items-start">
            <div
              v-if="preview.thumbnail"
              class="w-full md:w-56 shrink-0 aspect-video rounded-xl overflow-hidden shadow-lg border border-[#2c2c2c] relative bg-black/40 flex items-center justify-center"
            >
              <img :src="preview.thumbnail" alt="Video Thumbnail" class="w-full h-full object-cover" />
            </div>

            <div class="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h3
                  class="font-bold text-white text-lg md:text-xl leading-snug line-clamp-3 mb-2 tracking-wide"
                >
                  {{ preview.title }}
                </h3>
                <p class="text-sm text-gray-500">
                  Plataforma:
                  <span class="capitalize text-gray-300 font-semibold">{{ platform }}</span>
                </p>
              </div>

              <div class="mt-6 flex flex-wrap gap-3">
                <button
                  @click="handleDownload"
                  :disabled="isDownloading"
                  class="px-6 py-3 bg-[#009900] hover:bg-[#22c55e] disabled:bg-green-950/50 disabled:text-gray-500 text-black font-bold text-[14px] rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-green-900/15"
                >
                  <FontAwesomeIcon
                    :icon="isDownloading ? faSpinner : faDownload"
                    :spin="isDownloading"
                  />
                  <span>{{ isDownloading ? "Baixando..." : "Salvar no Dispositivo" }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>
