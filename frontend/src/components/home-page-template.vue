<script setup lang="ts">
import Sidebar from "./sidebar.vue";
import Header from "./header.vue";
import MainPageTemplate from "./main-page-template.vue";

interface Props {
  header: boolean;
  sidebar: boolean;
  title: string;
  searchInput?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  searchInput: true,
});

const searchQuery = defineModel<string>({ default: "" });
</script>

<template>
  <MainPageTemplate>
    <div class="flex h-screen bg-[#121212]">
      <Sidebar v-if="sidebar" />

      <div class="h-screen flex flex-col w-full">
        <Header
          v-if="header"
          v-model.trim="searchQuery"
          :search-input="searchInput"
        />

        <div
          :class="
            (!header ? 'mt-[85px] ' : '') +
            'pt-10 pb-5 flex flex-1 flex-col bg-[#1e1e1e] rounded-[24px] mr-8 mb-8 min-h-0'
          "
        >
          <h1
            v-if="title"
            class="px-12 mb-10 text-[24px] text-white font-medium shrink-0"
          >
            {{ title }}
          </h1>

          <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-12">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #444;
}
</style>
