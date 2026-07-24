<script setup lang="ts">
import { ref, watch } from "vue";
import Overlay from "./overlay.vue";
import Input from "./input.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api.ts";
import { API_ROUTES } from "../routing/routes.ts";
import { useToast } from "../composables/use-toast.ts";
import type { UserFile } from "../types/file.ts";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    file: UserFile | null;
    close: () => void;
    success: (newName: string) => Promise<void> | void;
    isMock?: boolean;
  }>(),
  {
    isMock: false,
  }
);

const { showToast } = useToast();

const newFileName = ref("");
const isRenaming = ref(false);
const renameError = ref("");

watch(
  () => props.file,
  (newVal) => {
    if (newVal) {
      newFileName.value = newVal.name;
      renameError.value = "";
    }
  },
  { immediate: true },
);

const submitRename = async () => {
  if (!props.file) return;
  if (!newFileName.value.trim()) {
    renameError.value = "O nome do arquivo não pode ser vazio!";
    return;
  }
  isRenaming.value = true;
  renameError.value = "";
  try {
    if (!props.isMock) {
      await api.patch(API_ROUTES.FILE.RENAME, {
        fileId: props.file.id,
        newName: newFileName.value.trim(),
      });
    }
    showToast("Arquivo renomeado com sucesso!", "success");
    await props.success(newFileName.value.trim());
    props.close();
  } catch (error: any) {
    console.error("Erro ao renomear arquivo:", error);
    renameError.value =
      error.response?.data?.message || "Erro ao renomear o arquivo.";
    showToast(renameError.value, "error");
  } finally {
    isRenaming.value = false;
  }
};
</script>

<template>
  <Overlay v-if="isOpen">
    <Transition name="modal-fade" appear>
      <div
        class="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-[450px] p-6 relative shadow-2xl overflow-hidden text-left"
      >
        <button
          @click="close()"
          :disabled="isRenaming"
          class="disabled:cursor-not-allowed absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer p-1.5 hover:bg-white/5 rounded-lg transition-colors"
        >
          <FontAwesomeIcon :icon="faXmark" class="w-4 h-4" />
        </button>

        <h3 class="text-white text-lg font-semibold mb-6">Renomear Arquivo</h3>

        <div class="flex flex-col gap-5">
          <Input
            v-model="newFileName"
            text="Digite o novo nome do arquivo"
            :error="renameError"
            :onKeyEnter="submitRename"
          />

          <div class="flex gap-3 w-full mt-2">
            <button
              @click="close()"
              :disabled="isRenaming"
              class="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-1 px-6 py-3 rounded-full bg-[#333] hover:bg-[#444] text-white font-semibold transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              :disabled="isRenaming"
              @click="submitRename"
              class="cursor-pointer flex-1 px-6 py-3 rounded-full bg-[#009900] hover:bg-[#22c55e] text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon
                v-if="isRenaming"
                :icon="faSpinner"
                spin
                class="mr-2"
              />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Overlay>
</template>
