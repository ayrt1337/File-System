<script setup lang="ts">
import { useRouter } from "vue-router";
import MainPageTemplate from "../../components/main-page-template.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faYoutube, faXTwitter } from "@fortawesome/free-brands-svg-icons";

const router = useRouter();

const downloadOptions = [
  {
    id: "youtube",
    name: "YouTube",
    description: "Baixe vídeos ou extraia áudio MP3",
    icon: faYoutube,
    colorClass: "text-red-500",
  },
  {
    id: "x",
    name: "X (Twitter)",
    description: "Baixe vídeos publicados no X",
    icon: faXTwitter,
    colorClass: "text-gray-100",
  },
];

const handleSelectWebsite = (siteId: string) => {
  router.push({
    name: "downloadVideosForm",
    query: { source: siteId },
  });
};
</script>

<template>
  <MainPageTemplate :search-input="false" :header="true" :sidebar="true" title="Baixar Vídeos">
    <div class="text-white">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="site in downloadOptions"
          :key="site.id"
          @click="handleSelectWebsite(site.id)"
          class="flex items-center justify-between p-4 bg-[#141414]/80 border border-[#222] rounded-xl cursor-pointer transition-all duration-300 group hover:bg-[#222] hover:border-[#333]"
        >
          <div class="flex items-center gap-2">
            <div class="relative w-12 h-10 flex items-center justify-center">
              <div :class="['text-2xl flex items-center justify-center', site.colorClass]">
                <FontAwesomeIcon :icon="site.icon" />
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-white font-semibold text-[15px] group-hover:text-white transition-colors duration-200 tracking-wide">
                {{ site.name }}
              </span>
              <span class="text-gray-500 text-[13px] font-normal group-hover:text-gray-400 transition-colors duration-200 mt-0.5">
                {{ site.description }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>