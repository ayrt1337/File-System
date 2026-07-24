<script setup lang="ts">
import Overlay from "./overlay.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useFilesUtils } from "../utils/files-utils.ts";
import type { UserFile } from "../types/file.ts";

defineProps<{
  isOpen: boolean;
  file: UserFile | null;
  close: () => void;
}>();

const { getFileIcon, getFileBgClass, formatSize, formatDate } = useFilesUtils();
</script>

<template>
  <Overlay v-if="isOpen && file">
    <div
      class="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-[550px] p-6 relative"
    >
      <button
        @click="close()"
        class="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer p-1.5 hover:bg-white/5 rounded-lg transition-colors"
      >
        <FontAwesomeIcon :icon="faXmark" class="w-4 h-4" />
      </button>

      <h3 class="text-white text-lg font-semibold mb-6">
        Informações do Arquivo
      </h3>

      <div class="flex flex-col gap-5">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shrink-0"
            :class="getFileBgClass(file.format)"
          >
            <FontAwesomeIcon
              :icon="getFileIcon(file.format)"
              class="text-2xl text-[#121212]"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p
              class="text-white font-medium text-base break-words"
              :title="file.name"
            >
              {{ file.name }}
            </p>
            <p class="text-gray-400 text-xs uppercase tracking-wider mt-0.5">
              {{ file.format }}
            </p>
          </div>
        </div>

        <div class="h-px bg-white/5"></div>

        <div class="flex flex-col gap-3.5 text-sm">
          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-normal">Tamanho</span>
            <span class="text-white font-medium">{{
              formatSize(file.size)
            }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-normal">Data de Envio</span>
            <span class="text-white font-medium">{{
              formatDate(file.createdAt)
            }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-normal">Última Modificação</span>
            <span class="text-white font-medium">
              {{ file.lastUpdate ? formatDate(file.lastUpdate) : "Nenhuma" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Overlay>
</template>
