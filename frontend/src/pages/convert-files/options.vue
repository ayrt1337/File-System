<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import MainPageTemplate from "../../components/main-page-template.vue";
import ConvertOptionCard from "../../components/convert-option-card.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faVideo, faMusic, faFileLines, faFileImage } from "@fortawesome/free-solid-svg-icons";

const router = useRouter();

const conversionOptions = [
  // Video Section
  { to: "mp4", title: "Converta qualquer vídeo para MP4", type: "video" as const },
  { to: "avi", title: "Converta qualquer vídeo para AVI", type: "video" as const },

  // Audio Section
  { to: "mp3", title: "Converta qualquer áudio/vídeo para MP3", type: "audio" as const },
  { to: "wav", title: "Converta qualquer áudio/vídeo para WAV", type: "audio" as const },

  // Document/File Section
  { from: "docx", to: "pdf", title: "Word para PDF", type: "document" as const },
  { from: "png", to: "pdf", title: "Imagem para PDF", type: "document" as const },

  // Image Section
  { to: "png", title: "Converta qualquer imagem para PNG", type: "image" as const },
  { to: "jpeg", title: "Converta qualquer imagem para JPEG", type: "image" as const },
  { to: "webp", title: "Converta qualquer imagem para WebP", type: "image" as const },
];

const videoOptions = computed(() => conversionOptions.filter((opt) => opt.type === "video"));
const audioOptions = computed(() => conversionOptions.filter((opt) => opt.type === "audio"));
const documentOptions = computed(() => conversionOptions.filter((opt) => opt.type === "document"));
const imageOptions = computed(() => conversionOptions.filter((opt) => opt.type === "image"));

const handleSelectOption = (option: typeof conversionOptions[0]) => {
  router.push({
    name: "convertFilesUpload",
    query: {
      type: option.type,
      from: option.from,
      to: option.to
    }
  });
};
</script>

<template>
  <MainPageTemplate :search-input="false" :header="true" :sidebar="true" title="Conversor de Arquivos">
    <div class="mx-auto text-white">
      <div v-if="videoOptions.length > 0" class="mb-12">
        <div class="flex items-center gap-3 mb-6 pb-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <FontAwesomeIcon :icon="faVideo" />
          </div>
          <h2 class="text-xl font-bold text-white">Vídeo</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ConvertOptionCard
            v-for="opt in videoOptions"
            :key="opt.from ? opt.from + '-' + opt.to : opt.to"
            :from="opt.from"
            :to="opt.to"
            :title="opt.title"
            :type="opt.type"
            @click="handleSelectOption(opt)"
          />
        </div>
      </div>

      <div v-if="audioOptions.length > 0" class="mb-12">
        <div class="flex items-center gap-3 mb-6 pb-3">
          <div class="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <FontAwesomeIcon :icon="faMusic" />
          </div>
          <h2 class="text-xl font-bold text-white">Áudio</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ConvertOptionCard
            v-for="opt in audioOptions"
            :key="opt.from ? opt.from + '-' + opt.to : opt.to"
            :from="opt.from"
            :to="opt.to"
            :title="opt.title"
            :type="opt.type"
            @click="handleSelectOption(opt)"
          />
        </div>
      </div>

      <div v-if="documentOptions.length > 0" class="mb-12">
        <div class="flex items-center gap-3 mb-6 pb-3">
          <div class="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
            <FontAwesomeIcon :icon="faFileLines" />
          </div>
          <h2 class="text-xl font-bold text-white">Documentos</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ConvertOptionCard
            v-for="opt in documentOptions"
            :key="opt.from ? opt.from + '-' + opt.to : opt.to"
            :from="opt.from"
            :to="opt.to"
            :title="opt.title"
            :type="opt.type"
            @click="handleSelectOption(opt)"
          />
        </div>
      </div>

      <div v-if="imageOptions.length > 0" class="mb-12">
        <div class="flex items-center gap-3 mb-6 pb-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <FontAwesomeIcon :icon="faFileImage" />
          </div>
          <h2 class="text-xl font-bold text-white">Imagens</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ConvertOptionCard
            v-for="opt in imageOptions"
            :key="opt.from ? opt.from + '-' + opt.to : opt.to"
            :from="opt.from"
            :to="opt.to"
            :title="opt.title"
            :type="opt.type"
            @click="handleSelectOption(opt)"
          />
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>