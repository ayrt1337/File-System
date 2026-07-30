<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
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
    redirect?: boolean;
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
    redirect: true,
  },
);

import { useFileCacheStore } from "../stores/file-cache";
import { onMounted } from "vue";

const { getFileIcon, getFileBgClass, hasPreview } = useFilesUtils();
const hasImageError = ref(false);
const router = useRouter();
const fileCacheStore = useFileCacheStore();
const resolvedPreviewUrl = ref<string | null>(null);
const hasRetriedPreview = ref(false);

const navigateToDetail = () => {
  router.push(`/file/${props.file.id}`);
};

const loadPreviewUrl = async () => {
  if (!hasPreview(props.file.format)) return;
  try {
    const urls = await fileCacheStore.getOrFetch(props.file.id, "preview");
    resolvedPreviewUrl.value = urls.preview;
  } catch (err) {
    console.warn(
      `Erro ao carregar preview para arquivo ${props.file.id}:`,
      err,
    );
  }
};

const handlePreviewError = async () => {
  if (!hasRetriedPreview.value) {
    hasRetriedPreview.value = true;
    fileCacheStore.invalidatePreviewCache(props.file.id);
    try {
      const urls = await fileCacheStore.getOrFetch(props.file.id, "preview");
      resolvedPreviewUrl.value = urls.preview;
    } catch (err) {
      console.warn(`Erro no auto-retry do preview do card ${props.file.id}:`, err);
      hasImageError.value = true;
    }
  } else {
    hasImageError.value = true;
  }
};

onMounted(() => {
  loadPreviewUrl();
});

watch(
  () => props.file.id,
  () => {
    hasImageError.value = false;
    resolvedPreviewUrl.value = null;
    hasRetriedPreview.value = false;
    loadPreviewUrl();
  },
);
</script>

<template>
  <div
    tabindex="0"
    @dblclick="redirect ? navigateToDetail() : null"
    class="relative flex flex-col gap-3 h-64 p-4 bg-[#1e1e1e]/60 backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/20 focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 focus:outline-none transition-all duration-300 group cursor-pointer"
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
        v-if="showFavorite && file.role === 3"
        @click.stop="onToggleFavorite?.(file)"
        class="p-1 rounded-lg hover:bg-white/5 cursor-pointer shrink-0 transition-colors"
        :class="
          file.isFavorite ? 'text-[#fbbf24]' : 'text-gray-400 hover:text-white'
        "
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
        v-if="resolvedPreviewUrl && !hasImageError"
        :src="resolvedPreviewUrl"
        @error="handlePreviewError"
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
          v-if="file.role === 3"
          @click.stop="onRestore?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faRotateLeft" class="w-4 h-4 text-gray-400" />
          <span>Restaurar</span>
        </button>

        <button
          v-if="file.role && file.role >= 1"
          @click.stop="onInfo?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faCircleInfo" class="w-4 h-4 text-gray-400" />
          <span>Informações</span>
        </button>

        <div v-if="file.role === 3" class="h-px bg-white/5 my-1"></div>

        <button
          v-if="file.role === 3"
          @click.stop="onPermanentDelete?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faTrashCan" class="w-4 h-4" />
          <span>Excluir permanentemente</span>
        </button>
      </template>

      <template v-else>
        <button
          v-if="file.role && file.role >= 1"
          @click.stop="onDownload?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faDownload" class="w-4 h-4 text-gray-400" />
          <span>Baixar</span>
        </button>

        <button
          v-if="file.role && file.role >= 2"
          @click.stop="onRename?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faPen" class="w-4 h-4 text-gray-400" />
          <span>Renomear</span>
        </button>

        <button
          v-if="file.role === 3"
          @click.stop="onShare?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faShareNodes" class="w-4 h-4 text-gray-400" />
          <span>Compartilhar</span>
        </button>

        <button
          v-if="file.role && file.role >= 1"
          @click.stop="onInfo?.(file)"
          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon :icon="faCircleInfo" class="w-4 h-4 text-gray-400" />
          <span>Informações sobre o arquivo</span>
        </button>

        <div v-if="file.role === 3" class="h-px bg-white/5 my-1"></div>

        <button
          v-if="file.role === 3"
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
