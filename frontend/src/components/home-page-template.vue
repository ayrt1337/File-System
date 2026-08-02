<script setup lang="ts">
import Sidebar from "./sidebar.vue";
import Header from "./header.vue";
import MainPageTemplate from "./main-page-template.vue";
import { ref } from "vue";

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
const isMobileMenuOpen = ref(false);
</script>

<template>
  <MainPageTemplate>
    <div class="flex h-screen bg-[#121212] overflow-hidden">
      <Sidebar v-if="sidebar" class="hidden lg:flex" />

      <div
        v-if="sidebar && isMobileMenuOpen"
        class="fixed inset-0 z-50 flex lg:hidden"
      >
        <div
          class="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          @click="isMobileMenuOpen = false"
        ></div>
        <Sidebar
          class="relative z-10 animate-in slide-in-from-left duration-200 shadow-2xl"
          @navigate="isMobileMenuOpen = false"
        />
      </div>

      <div class="h-screen flex flex-col w-full min-w-0">
        <Header
          v-if="header"
          v-model.trim="searchQuery"
          :search-input="searchInput"
          :show-mobile-menu-button="sidebar"
          @toggle-menu="isMobileMenuOpen = !isMobileMenuOpen"
        />

        <div
          :class="[
            !header ? 'mt-[70px] sm:mt-[85px]' : '',
            'pt-8 sm:pt-10 pb-4 sm:pb-5 flex flex-1 flex-col bg-[#1e1e1e] rounded-none lg:rounded-[24px] lg:mr-8 lg:mb-8 min-h-0'
          ]"
        >
          <h1
            v-if="title"
            class="px-3 sm:px-6 lg:px-12 mb-6 sm:mb-8 text-lg sm:text-[24px] text-white font-medium shrink-0"
          >
            {{ title }}
          </h1>

          <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-3 sm:px-6 lg:px-12">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
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

