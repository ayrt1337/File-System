<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../../services/api";
import MainPageTemplate from "../../components/main-page-template.vue";
import DragDropOverlay from "../../components/drag-drop-overlay.vue";
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
import axios from "axios";
import { useToast } from "../../composables/use-toast.ts";
import { getFilePreview } from "../../utils/get-file-preview";

const { showToast } = useToast();

const route = useRoute();
const router = useRouter();

const type = computed(() => route.query.type as string);
const fromFormat = computed(() => route.query.from as string);
const toFormat = computed(() => route.query.to as string);

const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const conversionStatus = ref<"idle" | "converting" | "success" | "error">(
  "idle",
);
const progress = ref(0);
const errorMessage = ref("");
const convertedFileName = ref("");
const convertedBlob = ref<Blob | null>(null);
const isUploading = ref<boolean>(false);

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

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (file) validateAndSetFile(file);
  }
};

const getTypeName = () => {
  switch (type.value) {
    case "image":
      return "imagem";
    case "video":
      return "vídeo";
    case "audio":
      return "áudio";
    case "document":
      return "documento";
  }
};

const validateAndSetFile = (file: File) => {
  if (fromFormat.value) {
    const ext = "." + fromFormat.value.toLowerCase();
    if (!file.name.toLowerCase().endsWith(ext)) {
      errorMessage.value = `Formato de arquivo inválido. Por favor, envie um arquivo ${fromFormat.value.toUpperCase()} (.${fromFormat.value.toLowerCase()}).`;
      conversionStatus.value = "error";
      selectedFile.value = null;
      return;
    }
  } else {
    const typeName = getTypeName();
    if (!file.type.startsWith(type.value.toLowerCase())) {
      errorMessage.value = `Formato de arquivo inválido. Por favor, envie um arquivo de tipo ${typeName}.`;
      conversionStatus.value = "error";
      selectedFile.value = null;
      return;
    }
  }

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    errorMessage.value =
      "O tamanho do arquivo excede o limite permitido de 10MB.";
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
  convertedBlob.value = null;
  errorMessage.value = "";
  conversionStatus.value = "idle";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const resetConversion = () => {
  clearFile();
};

const startConversion = async () => {
  if (!selectedFile.value) return;

  conversionStatus.value = "converting";
  progress.value = 0;

  const originalName = selectedFile.value.name;
  const baseName = originalName.substring(0, originalName.lastIndexOf("."));
  convertedFileName.value = `${baseName}.${toFormat.value.toLowerCase()}`;

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const response = await api.post("/convert", formData, {
      params: {
        from: fromFormat.value,
        to: toFormat.value,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 90) / progressEvent.total,
          );
          progress.value = percent;
        } else {
          progress.value = 45;
        }
      },
    });

    progress.value = 100;
    convertedBlob.value = response.data;

    setTimeout(() => {
      conversionStatus.value = "success";
    }, 200);
  } catch (error: any) {
    console.error("Erro na conversão:", error);
    errorMessage.value = "Erro na conversão do arquivo. Tente novamente.";
    conversionStatus.value = "error";
  }
};

const downloadConvertedFile = () => {
  if (!convertedBlob.value) return;
  const element = document.createElement("a");
  element.href = URL.createObjectURL(convertedBlob.value);
  element.download = convertedFileName.value;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const handleSaveFile = async () => {
  const fileBlob = convertedBlob.value;
  if (!fileBlob) return;

  isUploading.value = true;

  try {
    const file = new File([fileBlob], convertedFileName.value, { type: fileBlob.type });
    const filePreview = await getFilePreview(file);

    const { data } = await api.post("/upload-url", {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      preview: filePreview,
    });

    await axios.put(data.url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    showToast("Arquivo salvo com sucesso!", "success");
  } catch (error) {
    console.error("Erro no upload do arquivo:", error);
    showToast("Falha ao salvar arquivo.", "error");
  } finally {
    isUploading.value = false;
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
  }
};
</script>

<template>
  <MainPageTemplate
    :search-input="false"
    :header="true"
    :sidebar="true"
    title="Conversor de Arquivos"
  >
    <DragDropOverlay
      :disabled="conversionStatus === 'converting'"
      :subtitle="`Somente arquivos ${fromFormat ? '.' + fromFormat.toUpperCase() : 'de' + getTypeName()} de até 10MB`"
      :set-file="validateAndSetFile"
      :drag-change="() => (isDragging = !isDragging)"
    />

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
            Converter {{ fromFormat ? fromFormat.toUpperCase() : "" }} para
            {{ toFormat.toUpperCase() }}
          </h2>
          <p class="text-[15px] text-gray-500 mt-2">
            Selecione ou solte seu arquivo abaixo para iniciar a conversão.
          </p>
        </div>
      </div>

      <div
        class="bg-[#141414]/80 border border-[#222] rounded-3xl px-8 py-10 relative overflow-hidden"
      >
        <div v-if="!selectedFile && conversionStatus !== 'error'">
          <div
            @click="triggerFileInput"
            :class="[
              'flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 text-center select-none',
              isDragging
                ? 'border-[#009900] bg-[#009900]/5 scale-[1.01]'
                : 'border-[#333] hover:border-[#009900]/40 hover:bg-[#1a1a1a]/40',
            ]"
          >
            <input
              ref="fileInputRef"
              type="file"
              :accept="
                fromFormat
                  ? '.' + fromFormat.toLowerCase()
                  : type.toLowerCase() + '/*'
              "
              class="hidden"
              @change="onFileChange"
            />

            <div
              class="rounded-full size-13 bg-[#009900]/10 flex items-center justify-center text-[#009900] mb-4"
            >
              <FontAwesomeIcon :icon="faUpload" class="text-[27px]" />
            </div>

            <p class="font-semibold text-[17px] text-gray-200">
              Arraste e solte o arquivo aqui
            </p>
            <p class="text-[15px] text-gray-500 mt-2 max-w-xs leading-relaxed">
              Ou clique para escolher do dispositivo. Apenas arquivos
              <span
                v-if="fromFormat"
                class="text-gray-300 font-semibold uppercase"
                >.{{ fromFormat }}</span
              >
              {{ !fromFormat ? "de " + getTypeName() : "" }} de até 10MB.
            </p>
          </div>
        </div>

        <div v-else-if="selectedFile && conversionStatus === 'idle'">
          <div
            class="flex items-center gap-4 p-4 border border-[#222] bg-[#1a1a1a]/50 rounded-2xl mb-8"
          >
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm text-gray-200 truncate">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ formatSize(selectedFile.size) }}
              </p>
            </div>
            <button
              @click="clearFile"
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon :icon="faTimes" />
            </button>
          </div>

          <div class="flex justify-center gap-3">
            <button
              @click="clearFile"
              class="px-6 py-3 border border-[#333] hover:border-gray-600 hover:bg-gray-800/40 text-gray-300 font-semibold text-sm rounded-full transition-all duration-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              @click="startConversion"
              class="px-8 py-3 bg-[#009900] hover:bg-[#22c55e] text-black font-bold text-sm rounded-full transition-all duration-300 transform cursor-pointer shadow-lg shadow-green-900/15"
            >
              Converter para {{ toFormat.toUpperCase() }}
            </button>
          </div>
        </div>

        <div
          v-else-if="conversionStatus === 'converting'"
          class="py-6 flex flex-col items-center"
        >
          <div class="relative w-16 h-16 mb-6 flex items-center justify-center">
            <FontAwesomeIcon
              :icon="faSpinner"
              class="text-4xl text-[#009900]"
              spin
            />
          </div>

          <p class="font-semibold text-[17px] text-gray-200 mb-1">
            Processando seu arquivo...
          </p>
          <p class="text-[13px] text-gray-500">
            Isso pode levar alguns instantes.
          </p>

          <div class="w-full max-w-sm mt-8">
            <div
              class="flex justify-between text-xs text-gray-400 mb-2 font-mono"
            >
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

        <div
          v-else-if="conversionStatus === 'success'"
          class="py-6 flex flex-col items-center text-center"
        >
          <div
            class="w-16 h-16 rounded-full bg-[#009900]/10 border border-[#009900]/20 flex items-center justify-center text-[#009900] text-3xl mb-4"
          >
            <FontAwesomeIcon :icon="faCircleCheck" />
          </div>

          <h3 class="font-bold text-[17px] text-white mb-1">
            Conversão Concluída!
          </h3>
          <p class="text-[14px] text-gray-400 mb-6 max-w-md">
            Seu arquivo foi convertido com sucesso para o formato
            <span class="uppercase text-gray-200 font-semibold">{{
              toFormat
            }}</span
            >.
          </p>

          <div
            class="w-full max-w-sm flex items-center gap-4 p-4 border border-[#222] bg-[#1a1a1a]/30 rounded-2xl mb-8 text-left"
          >
            <div class="flex-1 min-w-0 text-center">
              <p class="font-semibold text-[15px] text-gray-200 truncate">
                {{ convertedFileName }}
              </p>
              <p class="text-[13px] text-gray-500 mt-1">
                Disponível para download
              </p>
            </div>
          </div>

          <div
            class="flex flex-col gap-3 w-full max-w-sm items-center"
          >
            <div class="flex gap-2">
              <button
                @click="downloadConvertedFile"
                class="disabled:bg-green-950/50 disabled:text-gray-500 px-8 py-3 bg-[#009900] hover:bg-[#22c55e] text-black font-bold text-sm rounded-full transition-all duration-300 transform cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-green-900/15"
                :disabled="isUploading"
              >
                <FontAwesomeIcon :icon="faDownload" />
                <span>{{ isUploading ? "Baixando..." : "Baixar Arquivo" }}</span>
              </button>

              <button
                @click="resetConversion"
                class="px-6 py-3 border border-[#333] hover:border-gray-600 hover:bg-gray-800/40 text-gray-300 font-semibold text-sm rounded-full transition-all duration-300 cursor-pointer"
                :disabled="isUploading"
              >
                Converter Outro
              </button>
            </div>

            <p
              @click="!isUploading ? handleSaveFile() : null"
              class="underline text-[#009900] cursor-pointer"
            >
              Salvar Arquivo
            </p>
          </div>
        </div>

        <div
          v-else-if="conversionStatus === 'error'"
          class="py-6 flex flex-col items-center text-center"
        >
          <div
            class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-3xl mb-4"
          >
            <FontAwesomeIcon :icon="faTriangleExclamation" />
          </div>

          <h3 class="font-bold text-lg text-white mb-1">Falha na Conversão</h3>
          <p class="text-sm text-red-400 mb-8 max-w-sm">
            {{ errorMessage }}
          </p>

          <button
            @click="resetConversion"
            class="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm rounded-full transition-all cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  </MainPageTemplate>
</template>
