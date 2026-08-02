<script setup lang="ts">
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faXmark,
  faRotateRight,
  faCircleCheck,
  faBan,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useUploadStore } from "../stores/upload";
import { useFilesUtils } from "../utils/files-utils";

const uploadStore = useUploadStore();
const { getFileIcon, getFileBgClass } = useFilesUtils();

const headerText = computed(() => {
  const activeCount = uploadStore.activeUploadsCount;
  const total = uploadStore.totalCount;
  const completed = uploadStore.completedCount;

  if (activeCount > 0) {
    return `Fazendo upload de ${activeCount} ${activeCount === 1 ? 'item' : 'itens'}`;
  }
  if (completed > 0 && completed === total) {
    return `${completed} ${completed === 1 ? 'upload concluído' : 'uploads concluídos'}`;
  }
  return "Upload finalizado";
});

const statusText = computed(() => {
  const activeCount = uploadStore.activeUploadsCount;
  if (activeCount > 0) {
    return "Iniciando upload...";
  }
  const hasErrors = uploadStore.uploads.some(u => u.status === 'error');
  if (hasErrors) {
    return "Alguns uploads falharam";
  }
  return "Uploads concluídos";
});
</script>

<template>
  <Transition name="fade-slide">
    <div
      v-if="uploadStore.isVisible"
      class="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-24px)] max-w-[360px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-[999] overflow-hidden flex flex-col font-sans transition-all duration-300"
    >
      <div
        class="bg-[#121212] px-4 py-3 flex items-center justify-between border-b border-white/5 select-none"
      >
        <span class="text-white text-[15px] font-semibold truncate">{{ headerText }}</span>
        <div class="flex items-center gap-2">
          <button
            @click="uploadStore.toggleMinimized"
            class="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <FontAwesomeIcon :icon="uploadStore.isMinimized ? faChevronUp : faChevronDown" class="h-3.5 w-3.5" />
          </button>
          <button
            @click="uploadStore.closeWidget"
            class="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <FontAwesomeIcon :icon="faXmark" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div v-show="!uploadStore.isMinimized" class="flex flex-col max-h-96">
        <div class="px-4 py-2.5 bg-[#1e1e1e] flex items-center justify-between text-[14px] text-gray-400 border-b border-white/5">
          <span>{{ statusText }}</span>
          <button
            v-if="uploadStore.hasActiveUploads"
            @click="uploadStore.cancelAllUploads"
            class="text-[#009900] hover:text-[#22c55e] font-medium transition-colors cursor-pointer"
          >
            Cancelar tudo
          </button>
          <button
            v-else
            @click="uploadStore.clearUploads"
            class="text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
          >
            Limpar
          </button>
        </div>

        <div class="overflow-y-auto divide-y divide-white/5 bg-[#1a1a1a] max-h-72 custom-scrollbar">
          <div
            v-for="item in uploadStore.uploads"
            :key="item.id"
            class="px-4 py-3 flex items-center justify-between gap-3 text-sm"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/5 flex items-center justify-center relative">
                <img
                  v-if="item.preview"
                  :src="item.preview"
                  class="w-full h-full object-cover"
                  alt="preview"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                  :class="getFileBgClass(item.type)"
                >
                  <FontAwesomeIcon
                    :icon="getFileIcon(item.type)"
                    class="text-sm text-[#121212]"
                  />
                </div>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-white font-medium truncate select-none" :title="item.name">
                  {{ item.name }}
                </span>
                <span class="text-[11px] text-gray-400 select-none">
                  {{ item.progress }}% • {{ (item.size / 1024).toFixed(0) }} KB
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <div v-if="item.status === 'uploading'" class="relative flex items-center justify-center w-6 h-6">
                <svg class="w-6 h-6 transform -rotate-90">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="rgba(255,255,255,0.1)"
                    stroke-width="2.5"
                    fill="transparent"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#22c55e"
                    stroke-width="2.5"
                    fill="transparent"
                    :stroke-dasharray="2 * Math.PI * 9"
                    :stroke-dashoffset="2 * Math.PI * 9 * (1 - item.progress / 100)"
                    stroke-linecap="round"
                    class="transition-all duration-300"
                  />
                </svg>
                <button
                  @click="uploadStore.cancelUpload(item.id)"
                  class="absolute inset-0 m-auto text-xs text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
                  title="Cancelar"
                >
                  <FontAwesomeIcon :icon="faXmark" class="h-2 w-2" />
                </button>
              </div>

              <FontAwesomeIcon
                v-else-if="item.status === 'completed'"
                :icon="faCircleCheck"
                class="text-[#22c55e] h-5 w-5"
              />

              <div v-else-if="item.status === 'cancelled'" class="flex items-center gap-2">
                <FontAwesomeIcon :icon="faBan" class="text-gray-500 h-4.5 w-4.5" />
                <button
                  @click="uploadStore.retryUpload(item.id)"
                  class="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Tentar novamente"
                >
                  <FontAwesomeIcon :icon="faRotateRight" class="h-3.5 w-3.5" />
                </button>
              </div>

              <div v-else-if="item.status === 'error'" class="flex items-center gap-2">
                <FontAwesomeIcon :icon="faTriangleExclamation" class="text-[#ef4444] h-4.5 w-4.5" />
                <button
                  @click="uploadStore.retryUpload(item.id)"
                  class="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Tentar novamente"
                >
                  <FontAwesomeIcon :icon="faRotateRight" class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
</style>
