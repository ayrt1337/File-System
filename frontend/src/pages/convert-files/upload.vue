<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import MainPageTemplate from "../../components/main-page-template.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { 
  faArrowLeft, 
  faUpload, 
  faTimes, 
  faSpinner, 
  faCircleCheck, 
  faTriangleExclamation,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const route = useRoute();
const router = useRouter();

const fromFormat = computed(() => (route.query.from as string) || "docx");
const toFormat = computed(() => (route.query.to as string) || "pdf");

const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const conversionStatus = ref<"idle" | "converting" | "success" | "error">("idle");
const progress = ref(0);
const errorMessage = ref("");
const convertedFileName = ref("");

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

let dragCounter = 0;

const onWindowDragEnter = (e: DragEvent) => {
  if (conversionStatus.value === "converting") return;
  e.preventDefault();
  dragCounter++;
  if (dragCounter === 1) {
    isDragging.value = true;
  }
};

const onWindowDragLeave = (e: DragEvent) => {
  if (conversionStatus.value === "converting") return;
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
};

const onWindowDragOver = (e: DragEvent) => {
  if (conversionStatus.value === "converting") return;
  e.preventDefault();
};

const onWindowDrop = (e: DragEvent) => {
  if (conversionStatus.value === "converting") return;
  e.preventDefault();
  isDragging.value = false;
  dragCounter = 0;
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
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

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (file) validateAndSetFile(file);
  }
};

const validateAndSetFile = (file: File) => {
  const ext = "." + fromFormat.value.toLowerCase();
  if (!file.name.toLowerCase().endsWith(ext)) {
    errorMessage.value = `Formato de arquivo inválido. Por favor, envie um arquivo ${fromFormat.value.toUpperCase()} (.${fromFormat.value.toLowerCase()}).`;
    conversionStatus.value = "error";
    selectedFile.value = null;
    return;
  }

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    errorMessage.value = "O tamanho do arquivo excede o limite permitido de 10MB.";
    conversionStatus.value = "error";
    selectedFile.value = null;
    return;
  }

  selectedFile.value = file;
  conversionStatus.value = "idle";
  errorMessage.value = "";
};

const clearFile = () => {
  selectedFile.value = null;
  errorMessage.value = "";
  conversionStatus.value = "idle";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const resetConversion = () => {
  clearFile();
};

const startConversion = () => {
  if (!selectedFile.value) return;

  conversionStatus.value = "converting";
  progress.value = 0;

  const originalName = selectedFile.value.name;
  const baseName = originalName.substring(0, originalName.lastIndexOf("."));
  convertedFileName.value = `${baseName}.${toFormat.value.toLowerCase()}`;

  const interval = setInterval(() => {
    progress.value += 10;
    if (progress.value >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        conversionStatus.value = "success";
      }, 300);
    }
  }, 150);
};

const downloadConvertedFile = () => {
  const element = document.createElement("a");
  const file = new Blob(["mock content"], { type: "application/octet-stream" });
  element.href = URL.createObjectURL(file);
  element.download = convertedFileName.value;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
</script>

<template>
  <MainPageTemplate :header="true" :sidebar="true" title="Conversor de Arquivos">
    <div 
      v-if="isDragging"
      class="fixed inset-0 bg-black/75 border-4 border-dashed border-[#009900] flex flex-col items-center justify-center z-50 transition-all duration-300 pointer-events-none"
    >
      <div class="flex flex-col items-center text-center p-6">
        <div class="w-20 h-20 rounded-full bg-[#009900]/10 flex items-center justify-center text-[#009900] mb-6 animate-bounce">
          <FontAwesomeIcon :icon="faUpload" class="text-3xl" />
        </div>
        <p class="text-2xl font-bold text-white">Solte o arquivo para iniciar</p>
        <p class="text-sm text-gray-400 mt-2">
          Somente arquivos <span class="uppercase font-semibold text-white">.{{ fromFormat }}</span> de até 10MB
        </p>
      </div>
    </div>

    <div class="max-w-2xl mx-auto text-white mt-10">
      <div class="flex items-center gap-4 mb-8">
        <button 
          @click="router.push('/convert-files')" 
          class="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#141414] hover:bg-[#222] transition-colors text-gray-400 hover:text-white cursor-pointer"
        >
          <FontAwesomeIcon :icon="faArrowLeft" />
        </button>
        <div>
          <h2 class="text-xl font-bold text-white leading-none">
            Converter {{ fromFormat.toUpperCase() }} para {{ toFormat.toUpperCase() }}
          </h2>
          <p class="text-[15px] text-gray-500 mt-2">Selecione ou solte seu arquivo abaixo para iniciar a conversão.</p>
        </div>
      </div>

      <div class="bg-[#141414]/80 border border-[#222] rounded-3xl px-8 py-10 relative overflow-hidden">
        <div v-if="!selectedFile && conversionStatus !== 'error'">
          <div 
            @click="triggerFileInput"
            :class="[
              'flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 text-center select-none',
              isDragging 
                ? 'border-[#009900] bg-[#009900]/5 scale-[1.01]' 
                : 'border-[#333] hover:border-[#009900]/40 hover:bg-[#1a1a1a]/40'
            ]"
          >
            <input 
              ref="fileInputRef" 
              type="file" 
              :accept="'.' + fromFormat.toLowerCase()" 
              class="hidden" 
              @change="onFileChange"
            />

            <div class="rounded-full bg-[#009900]/10 flex items-center justify-center text-[#009900] mb-4">
              <FontAwesomeIcon :icon="faUpload" class="text-[30px]" />
            </div>

            <p class="font-semibold text-[17px] text-gray-200">Arraste e solte o arquivo aqui</p>
            <p class="text-[15px] text-gray-500 mt-2 max-w-xs leading-relaxed">
              Ou clique para escolher do dispositivo. Apenas arquivos <span class="text-gray-300 font-semibold uppercase">.{{ fromFormat }}</span> de até 10MB.
            </p>
          </div>
        </div>

        <div v-else-if="selectedFile && conversionStatus === 'idle'">
          <div class="flex items-center gap-4 p-4 border border-[#222] bg-[#1a1a1a]/50 rounded-2xl mb-8">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm text-gray-200 truncate">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatSize(selectedFile.size) }}</p>
            </div>
            <button 
              @click="clearFile" 
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon :icon="faTimes" />
            </button>
          </div>

          <div class="flex justify-end gap-3">
            <button 
              @click="clearFile" 
              class="px-6 py-3 border border-[#333] hover:border-gray-600 hover:bg-gray-800/40 text-gray-300 font-semibold text-sm rounded-full transition-all duration-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              @click="startConversion" 
              class="px-8 py-3 bg-[#009900] hover:bg-[#22c55e] text-black font-bold text-sm rounded-full transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-lg shadow-green-900/15"
            >
              Converter para {{ toFormat.toUpperCase() }}
            </button>
          </div>
        </div>

        <div v-else-if="conversionStatus === 'converting'" class="py-6 flex flex-col items-center">
          <div class="relative w-16 h-16 mb-6 flex items-center justify-center">
            <FontAwesomeIcon :icon="faSpinner" class="text-4xl text-[#009900]" spin />
          </div>

          <p class="font-semibold text-base text-gray-200 mb-1">Processando seu arquivo...</p>
          <p class="text-xs text-gray-500">Isso pode levar alguns instantes.</p>

          <div class="w-full max-w-sm mt-8">
            <div class="flex justify-between text-xs text-gray-400 mb-2 font-mono">
              <span>Progresso</span>
              <span>{{ progress }}%</span>
            </div>
            <div class="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-[#009900] transition-all duration-200" 
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div v-else-if="conversionStatus === 'success'" class="py-6 flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-[#009900]/10 border border-[#009900]/20 flex items-center justify-center text-[#009900] text-3xl mb-4">
            <FontAwesomeIcon :icon="faCircleCheck" />
          </div>

          <h3 class="font-bold text-lg text-white mb-1">Conversão Concluída!</h3>
          <p class="text-xs text-gray-400 mb-6 max-w-md">
            Seu arquivo foi convertido com sucesso para o formato <span class="uppercase text-gray-200 font-semibold">{{ toFormat }}</span>.
          </p>

          <div class="w-full max-w-sm flex items-center gap-4 p-4 border border-[#222] bg-[#1a1a1a]/30 rounded-2xl mb-8 text-left">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm text-gray-200 truncate">{{ convertedFileName }}</p>
              <p class="text-xs text-gray-500 mt-1">Disponível para download</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
            <button 
              @click="resetConversion" 
              class="px-6 py-3 border border-[#333] hover:border-gray-600 hover:bg-gray-800/40 text-gray-300 font-semibold text-sm rounded-full transition-all duration-300 cursor-pointer"
            >
              Converter Outro
            </button>
            <button 
              @click="downloadConvertedFile" 
              class="px-8 py-3 bg-[#009900] hover:bg-[#22c55e] text-black font-bold text-sm rounded-full transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-green-900/15"
            >
              <FontAwesomeIcon :icon="faDownload" />
              Baixar Arquivo
            </button>
          </div>
        </div>

        <div v-else-if="conversionStatus === 'error'" class="py-6 flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-3xl mb-4">
            <FontAwesomeIcon :icon="faTriangleExclamation" />
          </div>

          <h3 class="font-bold text-lg text-white mb-1">Falha na Conversão</h3>
          <p class="text-sm text-red-400 mb-8 max-w-sm">
            {{ errorMessage }}
          </p>

          <button 
            @click="resetConversion" 
            class="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-full transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>
