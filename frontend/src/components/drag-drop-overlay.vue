<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

interface Props {
  disabled?: boolean;
  subtitle?: string;
  setFile: (file: File) => void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const isDragging = ref(false);

let dragCounter = 0;

const onWindowDragEnter = (e: DragEvent) => {
  if (props.disabled) return;
  e.preventDefault();
  dragCounter++;
  if (dragCounter === 1) {
    isDragging.value = true;
  }
};

const onWindowDragLeave = (e: DragEvent) => {
  if (props.disabled) return;
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
};

const onWindowDragOver = (e: DragEvent) => {
  if (props.disabled) return;
  e.preventDefault();
};

const onWindowDrop = (e: DragEvent) => {
  if (props.disabled) return;
  e.preventDefault();
  isDragging.value = false;
  dragCounter = 0;

  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file) props.setFile(file);
  }
};

onMounted(() => {
  window.addEventListener("dragenter", onWindowDragEnter);
  window.addEventListener("dragleave", onWindowDragLeave);
  window.addEventListener("dragover", onWindowDragOver);
  window.addEventListener("drop", onWindowDrop);
});

onUnmounted(() => {
  window.removeEventListener("dragenter", onWindowDragEnter);
  window.removeEventListener("dragleave", onWindowDragLeave);
  window.removeEventListener("dragover", onWindowDragOver);
  window.removeEventListener("drop", onWindowDrop);
});
</script>

<template>
  <div
    v-if="isDragging"
    class="fixed inset-0 bg-black/75 border-4 border-dashed border-[#009900] flex flex-col items-center justify-center z-50 transition-all duration-300 pointer-events-none"
  >
    <div class="flex flex-col items-center text-center p-6">
      <div
        class="w-20 h-20 rounded-full bg-[#009900]/10 flex items-center justify-center text-[#009900] mb-6 animate-bounce"
      >
        <FontAwesomeIcon :icon="faUpload" class="text-3xl" />
      </div>
      <p class="text-2xl font-bold text-white">
        Solte o arquivo para iniciar
      </p>
      <p class="text-sm text-gray-400 mt-2">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
