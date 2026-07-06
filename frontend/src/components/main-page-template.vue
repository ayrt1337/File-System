<script setup lang="ts">
import Sidebar from "../components/sidebar.vue";
import Header from "../components/header.vue";
import LoadingSpinner from "../components/loading-spinner.vue";
import ServerError from "./server-error.vue";
import Unauthorized from "./unauthorized.vue";
import Toast from "./toast.vue";
import { useLoading } from "../composables/use-loading";
import { useServerError } from "../composables/use-server-error";
import { useUnauthorized } from "../composables/use-unauthorized";

interface Props {
  header: boolean;
  sidebar: boolean;
  title: string;
  searchInput?: boolean;
  getFiles?: () => Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  searchInput: true,
});

const searchQuery = defineModel<string>({ default: "" });

const { showLoading } = useLoading();
const { showError } = useServerError();
const { showUnauthorized } = useUnauthorized();
</script>

<template>
  <Toast />
  <LoadingSpinner v-if="showLoading" />

  <template v-else>
    <ServerError v-if="showError" />
    <Unauthorized v-else-if="showUnauthorized" />

    <div v-else class="flex h-screen bg-[#121212]">
      <Sidebar :get-files="getFiles" v-if="sidebar" />

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
  </template>
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

.popup-enter-active,
.error-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.popup-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}
</style>
