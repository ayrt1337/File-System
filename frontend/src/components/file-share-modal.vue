<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Overlay from "./overlay.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faLock,
  faChevronDown,
  faLink,
  faGlobe,
  faCheck,
  faXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "../stores/auth.ts";
import type { UserFile } from "../types/file.ts";
import Input from "./input.vue";
import UserImage from "../assets/981d6b2e0ccb5e968a0618c8d47671da.jpg";
import { api } from "../services/api";
import { API_ROUTES } from "../routing/routes";
import { useToast } from "../composables/use-toast.ts";

const props = defineProps<{
  isOpen: boolean;
  file: UserFile | null;
  close: () => void;
}>();

const { showToast } = useToast();
const authStore = useAuthStore();
const user = computed(() => authStore.getUser);

const generalAccess = ref<"restricted" | "public">("restricted");
const isAccessDropdownOpen = ref(false);
const isCopied = ref(false);
const isSalving = ref<boolean>(false);

interface SharedUser {
  email: string;
  name: string;
  avatarUrl: string | null;
  role: "reader" | "editor";
}

const emailInput = ref("");
const emailError = ref("");
const isSearchingUser = ref(false);
const openRoleMenuIndex = ref<number | null>(null);
const sharedUsers = ref<SharedUser[]>([]);

const publicRole = ref<"reader" | "editor">("reader");
const isPublicRoleMenuOpen = ref(false);

const closeRoleMenus = () => {
  openRoleMenuIndex.value = null;
  isPublicRoleMenuOpen.value = false;
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      isCopied.value = false;
      isAccessDropdownOpen.value = false;
      emailInput.value = "";
      emailError.value = "";
      sharedUsers.value = props.file?.sharedUsers ? JSON.parse(JSON.stringify(props.file.sharedUsers)) : [];
      generalAccess.value = props.file?.isPublic ? "public" : "restricted";
      publicRole.value = props.file?.publicRole === 2 ? "editor" : "reader";
      openRoleMenuIndex.value = null;
      isPublicRoleMenuOpen.value = false;
      window.addEventListener("click", closeRoleMenus);
    } else {
      window.removeEventListener("click", closeRoleMenus);
    }
  },
);

const shareUrl = computed(() => {
  if (!props.file) return "";
  return `${window.location.origin}/file/${props.file.id}`;
});

const copyShareUrl = () => {
  if (!shareUrl.value) return;
  navigator.clipboard.writeText(shareUrl.value);
  isCopied.value = true;
};

const toggleAccessMenu = (event: Event) => {
  event.stopPropagation();
  isAccessDropdownOpen.value = !isAccessDropdownOpen.value;
};

const selectAccess = (type: "restricted" | "public") => {
  generalAccess.value = type;
  isAccessDropdownOpen.value = false;
};

const handleAddEmail = async () => {
  emailError.value = "";

  const email = emailInput.value.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.value = "Email inválido";
    return;
  }

  if (user.value?.email && email === user.value.email.toLowerCase()) {
    emailError.value = "Você já é o proprietário";
    return;
  }

  const alreadyAdded = sharedUsers.value.some(
    (u) => u.email.toLowerCase() === email,
  );
  if (alreadyAdded) {
    emailError.value = "Este e-mail já foi adicionado";
    return;
  }

  isSearchingUser.value = true;
  try {
    const { data } = await api.get(API_ROUTES.USER.CHECK_EMAIL, {
      params: { email },
    });

    sharedUsers.value.push({
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      role: "reader",
    });

    emailInput.value = "";
  } catch (err: any) {
    if (err.response?.status === 404) {
      emailError.value = "Usuário não encontrado!";
    } else if (err.response?.data?.message) {
      emailError.value = err.response.data.message;
    } else {
      emailError.value = "Erro ao buscar usuário";
    }
  } finally {
    isSearchingUser.value = false;
  }
};

const toggleUserRoleMenu = (index: number, event: Event) => {
  event.stopPropagation();
  if (openRoleMenuIndex.value === index) {
    openRoleMenuIndex.value = null;
  } else {
    openRoleMenuIndex.value = index;
  }
};

const changeUserRole = (index: number, role: "reader" | "editor") => {
  const targetUser = sharedUsers.value[index];
  if (targetUser) {
    targetUser.role = role;
  }
  openRoleMenuIndex.value = null;
};

const removeUserAccess = (index: number) => {
  sharedUsers.value.splice(index, 1);
  openRoleMenuIndex.value = null;
};

const togglePublicRoleMenu = (event: Event) => {
  event.stopPropagation();
  isPublicRoleMenuOpen.value = !isPublicRoleMenuOpen.value;
};

const changePublicRole = (role: "reader" | "editor") => {
  publicRole.value = role;
  isPublicRoleMenuOpen.value = false;
};

const handleSave = async () => {
  if (!props.file) return;

  isSalving.value = true;

  try {
    const usersToShare = sharedUsers.value.map((u) => ({
      email: u.email,
      role: u.role,
    }));

    const publicAccess = {
      isPublic: generalAccess.value === "public",
      publicRole: generalAccess.value === "public" ? publicRole.value : null,
    };

    const { data } = await api.patch(API_ROUTES.FILE.ACCESS, {
      fileId: props.file.id,
      usersAccess: usersToShare,
      publicAccess: publicAccess,
    });

    props.file.isPublic = data.isPublic;
    props.file.publicRole = data.publicRole;
    props.file.sharedUsers = data.sharedUsers;

    showToast("Alterações salvas!", "success")
  } catch (error) {
    console.error("Erro ao salvar compartilhamento:", error);
    showToast("Erro ao salvar compartilhamento!", "error")
  } finally {
    props.close();
    isSalving.value = false;
  }
};
</script>

<template>
  <Overlay v-if="isOpen && file">
    <div
      @click.stop
      class="bg-[#1e1e1e] border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-[550px] p-4 sm:p-6 relative shadow-2xl text-left max-h-[90vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between gap-3 mb-4 sm:mb-6 min-w-0">
        <h3
          class="text-white text-base sm:text-[20px] font-normal leading-normal select-none truncate flex-1 min-w-0"
          :title="`Compartilhar &quot;${file.name}&quot;`"
        >
          Compartilhar {{ file.name }}
        </h3>

        <button
          @click="close()"
          :disabled="isSalving"
          class="disabled:cursor-not-allowed text-gray-400 hover:text-white cursor-pointer p-1.5 hover:bg-white/5 rounded-lg transition-colors shrink-0"
        >
          <FontAwesomeIcon :icon="faXmark" class="w-4 h-4" />
        </button>
      </div>

      <div class="mb-4 sm:mb-5 flex flex-col sm:flex-row gap-2">
        <Input
          v-model="emailInput"
          text="Participantes (email)"
          :error="emailError"
          :on-key-enter="handleAddEmail"
        />
        <button
          v-if="emailInput.trim().length > 0"
          @click="handleAddEmail"
          :disabled="isSearchingUser"
          class="h-[46px] sm:h-[52px] px-5 sm:px-6 bg-[#009900] hover:bg-[#22c55e] disabled:bg-gray-800 disabled:text-gray-500 text-white text-xs sm:text-sm font-semibold rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <FontAwesomeIcon
            v-if="isSearchingUser"
            :icon="faSpinner"
            class="animate-spin"
          />
          <span>Adicionar</span>
        </button>
      </div>

      <div class="mb-5 sm:mb-6 flex flex-col gap-3 sm:gap-4">
        <h4 class="text-white sm:text-[15px] font-medium select-none">
          Pessoas com acesso
        </h4>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              :src="user?.avatarUrl || UserImage"
              class="rounded-full size-10 sm:size-10 object-cover border border-white/10 shrink-0"
              alt="Avatar"
            />
            <div class="flex flex-col min-w-0">
              <span class="text-white text-[14px] sm:text-sm font-normal truncate"
                >{{ user?.name }} (você)</span
              >
              <span class="text-gray-400 text-[12px] sm:text-xs truncate">{{ user?.email }}</span>
            </div>
          </div>
          <span class="text-gray-500 text-xs sm:text-sm font-normal select-none shrink-0"
            >Proprietário</span
          >
        </div>

        <div
          v-for="(sharedUser, index) in sharedUsers"
          :key="sharedUser.email"
          class="flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              :src="sharedUser.avatarUrl || UserImage"
              class="rounded-full size-8 sm:size-10 object-cover border border-white/10 shrink-0"
              alt="Avatar"
            />
            <div class="flex flex-col min-w-0">
              <span class="text-white text-[14px] sm:text-sm font-normal truncate">{{
                sharedUser.name
              }}</span>
              <span class="text-gray-400 text-[12px] sm:text-xs truncate">{{ sharedUser.email }}</span>
            </div>
          </div>

          <div class="relative shrink-0">
            <button
              @click.stop="toggleUserRoleMenu(index, $event)"
              class="flex items-center gap-1 text-white text-xs sm:text-sm font-medium cursor-pointer hover:text-white/80 select-none py-1 px-2.5 sm:py-1.5 sm:px-3 bg-white/5 border border-white/10 rounded-full transition-colors"
            >
              <span>{{
                sharedUser.role === "reader" ? "Leitor" : "Editor"
              }}</span>
              <FontAwesomeIcon :icon="faChevronDown" class="text-[9px]" />
            </button>

            <Transition name="dropdown-fade">
              <div
                v-if="openRoleMenuIndex === index"
                class="absolute right-0 top-9 min-w-[160px] bg-[#1a1a1a] border border-white/10 rounded-xl z-50 py-1.5 flex flex-col overflow-hidden text-right shadow-xl"
              >
                <button
                  @click="changeUserRole(index, 'reader')"
                  class="w-full px-3 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                >
                  <div
                    class="w-4 h-4 flex items-center justify-center shrink-0"
                  >
                    <FontAwesomeIcon
                      v-if="sharedUser.role === 'reader'"
                      :icon="faCheck"
                      class="text-[#22c55e] text-xs"
                    />
                  </div>
                  <span>Leitor</span>
                </button>

                <button
                  @click="changeUserRole(index, 'editor')"
                  class="w-full px-3 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                >
                  <div
                    class="w-4 h-4 flex items-center justify-center shrink-0"
                  >
                    <FontAwesomeIcon
                      v-if="sharedUser.role === 'editor'"
                      :icon="faCheck"
                      class="text-[#22c55e] text-xs"
                    />
                  </div>
                  <span>Editor</span>
                </button>

                <div class="border-t border-white/5 my-1"></div>

                <button
                  @click="removeUserAccess(index)"
                  class="w-full px-3 py-2 text-left text-xs sm:text-sm text-red-500 hover:text-red-400 hover:bg-white/5 flex items-center transition-colors cursor-pointer"
                >
                  <span>Remover acesso</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="mb-6 sm:mb-8">
        <h4 class="text-white text-[14px] sm:text-[15px] font-medium mb-3 sm:mb-3 select-none">
          Acesso geral
        </h4>
        <div class="flex flex sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <div
              class="w-8 h-8 sm:w-[36px] sm:h-[36px] rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors"
              :class="
                generalAccess === 'restricted'
                  ? 'bg-white/10 text-white'
                  : 'bg-[#0f5132] text-[#22c55e]'
              "
            >
              <FontAwesomeIcon
                :icon="generalAccess === 'restricted' ? faLock : faGlobe"
                class="text-xs sm:text-sm"
              />
            </div>

            <div class="flex-1 flex flex-col min-w-0 relative">
              <div
                @click.stop="toggleAccessMenu"
                class="flex items-center gap-1.5 text-white text-[14px] sm:text-sm font-medium cursor-pointer hover:text-white/80 w-fit select-none"
              >
                <span>{{
                  generalAccess === "restricted"
                    ? "Restrito"
                    : "Público"
                }}</span>
                <FontAwesomeIcon :icon="faChevronDown" class="text-[9px]" />
              </div>
              <span class="text-gray-400 text-[12px] sm:text-xs mt-0.5 select-none leading-tight">
                {{
                  generalAccess === "restricted"
                    ? "Só as pessoas com acesso podem abrir."
                    : "Qualquer pessoa com o link pode ver"
                }}
              </span>

              <Transition name="dropdown-fade">
                <div
                  v-if="isAccessDropdownOpen"
                  class="absolute left-0 top-6 min-w-[200px] sm:min-w-[240px] bg-[#1a1a1a] border border-white/10 rounded-xl z-50 py-1.5 flex flex-col overflow-hidden text-left shadow-xl"
                >
                  <button
                    @click="selectAccess('restricted')"
                    class="w-full px-3 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <div
                      class="w-4 h-4 flex items-center justify-center shrink-0"
                    >
                      <FontAwesomeIcon
                        v-if="generalAccess === 'restricted'"
                        :icon="faCheck"
                        class="text-[#22c55e] text-xs"
                      />
                    </div>
                    <span>Restrito</span>
                  </button>

                  <button
                    @click="selectAccess('public')"
                    class="w-full px-3 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <div
                      class="w-4 h-4 flex items-center justify-center shrink-0"
                    >
                      <FontAwesomeIcon
                        v-if="generalAccess === 'public'"
                        :icon="faCheck"
                        class="text-[#22c55e] text-xs"
                      />
                    </div>
                    <span>Público</span>
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <div v-if="generalAccess === 'public'" class="relative shrink-0 self-center">
            <button
              @click.stop="togglePublicRoleMenu"
              class="flex items-center gap-1.5 text-white text-xs sm:text-sm font-medium cursor-pointer hover:text-white/80 select-none py-1 px-3 bg-white/5 border border-white/10 rounded-full transition-colors"
            >
              <span>{{ publicRole === "reader" ? "Leitor" : "Editor" }}</span>
              <FontAwesomeIcon :icon="faChevronDown" class="text-[9px]" />
            </button>

            <Transition name="dropdown-fade">
              <div
                v-if="isPublicRoleMenuOpen"
                class="absolute right-0 top-9 min-w-[160px] bg-[#1a1a1a] border border-white/10 rounded-xl z-50 py-1.5 flex flex-col overflow-hidden text-right shadow-xl"
              >
                <button
                  @click="changePublicRole('reader')"
                  class="w-full px-3 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                >
                  <div
                    class="w-4 h-4 flex items-center justify-center shrink-0"
                  >
                    <FontAwesomeIcon
                      v-if="publicRole === 'reader'"
                      :icon="faCheck"
                      class="text-[#22c55e] text-xs"
                    />
                  </div>
                  <span>Leitor</span>
                </button>

                <button
                  @click="changePublicRole('editor')"
                  class="w-full px-3 py-2 text-left text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                >
                  <div
                    class="w-4 h-4 flex items-center justify-center shrink-0"
                  >
                    <FontAwesomeIcon
                      v-if="publicRole === 'editor'"
                      :icon="faCheck"
                      class="text-[#22c55e] text-xs"
                    />
                  </div>
                  <span>Editor</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
        <button
          @click="copyShareUrl"
          class="px-3 sm:px-5 py-2 sm:py-2.5 border border-white/20 hover:border-white/30 hover:bg-white/5 text-white text-[14px] sm:text-sm font-semibold rounded-full cursor-pointer flex items-center gap-1.5 sm:gap-2"
        >
          <FontAwesomeIcon
            :icon="isCopied ? faCheck : faLink"
            class="text-xs"
          />
          <span>{{ isCopied ? "Copiado" : "Copiar link" }}</span>
        </button>

        <button
          @click="handleSave"
          class="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#009900] hover:bg-[#22c55e] text-white text-[14px] sm:text-sm font-semibold rounded-full transition-colors cursor-pointer"
        >
          Salvar
        </button>
      </div>
    </div>
  </Overlay>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
