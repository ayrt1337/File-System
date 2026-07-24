<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faEllipsis,
  faDownload,
  faShareNodes,
  faCircleInfo,
  faTrashCan,
  faPen,
  faStar,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { useFilesUtils } from "../utils/files-utils.ts";
import type { UserFile } from "../types/file.ts";

const props = withDefaults(
  defineProps<{
    file: UserFile;
    index: number;
    openMenuIndex: number | null;
    showFavorite?: boolean;
    isInTrash?: boolean;
    onToggleFavorite?: (file: UserFile) => void;
    onToggleMenu?: (index: number) => void;
    onDownload?: (file: UserFile) => void;
    onRename?: (file: UserFile) => void;
    onShare?: (file: UserFile) => void;
    onInfo?: (file: UserFile) => void;
    onDelete?: (file: UserFile) => void;
    onRestore?: (file: UserFile) => void;
    onPermanentDelete?: (file: UserFile) => void;
  }>(),
  {
    showFavorite: true,
    isInTrash: false,
  }
);

const { getFileIcon, getFileBgClass } = useFilesUtils();
</script>

<template>
  <div
    class="relative flex flex-col gap-3 h-64 p-4 bg-[#1e1e1e]/60 backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 group cursor-default"
  >
    <div class="flex items-center justify-between w-full min-w-0 gap-2">
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <div
          class="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          :class="getFileBgClass(file.format)"
        >
          <FontAwesomeIcon
            :icon="getFileIcon(file.format)"
            class="text-xs text-[#121212]"
          />
        </div>
        <h4
          class="text-white text-sm font-medium truncate select-none"
          :title="file.name"
        >
          {{ file.name }}
        </h4>
      </div>

      <button
        v-if="showFavorite"
        @click.stop="onToggleFavorite?.(file)"
        class="p-1 rounded-lg hover:bg-white/5 cursor-pointer shrink-0 transition-colors"
        :class="file.isFavorite ? 'text-[#fbbf24]' : 'text-gray-400 hover:text-white'"
      >
        <FontAwesomeIcon
          :icon="file.isFavorite ? faStar : faStarRegular"
          class="h-4 w-4"
        />
      </button>

      <button
        @click.stop="onToggleMenu?.(index)"
        class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer shrink-0 transition-colors"
      >
        <FontAwesomeIcon :icon="faEllipsis" class="h-4 w-4" />
      </button>
    </div>

    <div
      class="flex-1 bg-[#121212]/80 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden"
    >
      <img
        v-if="file.preview"
        :src="file.preview"
        class="w-full h-full object-cover"
        alt="File preview"
      />
      <div
        v-else
        class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
        :class="getFileBgClass(file.format)"
      >
        <FontAwesomeIcon
          :icon="getFileIcon(file.format)"
          class="text-3xl text-[#121212]"
        />
      </div>
    </div>

    <div
      v-if="openMenuIndex === index"
      class="absolute right-4 top-12 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-40 py-1.5 flex flex-col overflow-hidden"
    >
      <template v-if="isInTrash">
        <button
          @click.stop="onRestore?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon
            :icon="faRotateLeft"
            class="w-4 h-4 text-gray-400"
          />
          <span>Restaurar</span>
        </button>

        <button
          @click.stop="onInfo?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon
            :icon="faCircleInfo"
            class="w-4 h-4 text-gray-400"
          />
          <span>Informações</span>
        </button>

        <div class="h-px bg-white/5 my-1"></div>

        <button
          @click.stop="onPermanentDelete?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faTrashCan" class="w-4 h-4" />
          <span>Excluir permanentemente</span>
        </button>
      </template>

      <template v-else>
        <button
          @click.stop="onDownload?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon
            :icon="faDownload"
            class="w-4 h-4 text-gray-400"
          />
          <span>Baixar</span>
        </button>

        <button
          @click.stop="onRename?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faPen" class="w-4 h-4 text-gray-400" />
          <span>Renomear</span>
        </button>

        <button
          @click.stop="onShare?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon
            :icon="faShareNodes"
            class="w-4 h-4 text-gray-400"
          />
          <span>Compartilhar</span>
        </button>

        <button
          @click.stop="onInfo?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon
            :icon="faCircleInfo"
            class="w-4 h-4 text-gray-400"
          />
          <span>Informações sobre o arquivo</span>
        </button>

        <div class="h-px bg-white/5 my-1"></div>

        <button
          @click.stop="onDelete?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faTrashCan" class="w-4 h-4" />
          <span>Mover para a lixeira</span>
        </button>
      </template>
    </div>
  </div>
</template>
