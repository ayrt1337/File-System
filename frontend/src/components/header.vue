<script setup lang="ts">
import Input from "./input.vue";
import { ref, onMounted, onUnmounted, computed } from "vue";
import UserImage from "../assets/981d6b2e0ccb5e968a0618c8d47671da.jpg";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faXmark,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { router } from "../router";
import { useAuthStore } from "../stores/auth.ts";

const authStore = useAuthStore();
const user = computed(() => authStore.getUser);

interface Props {
  searchInput: boolean;
  showMobileMenuButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showMobileMenuButton: true,
});

const emit = defineEmits<{
  (e: "toggleMenu"): void;
}>();

const query = defineModel<string>();

const popup = ref<boolean>(false);
const popupRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const avatarImage = document.querySelector(".profile-avatar");

  if (
    popup.value &&
    popupRef.value &&
    !popupRef.value.contains(target) &&
    avatarImage &&
    !avatarImage.contains(target)
  ) {
    popup.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    class="flex items-center justify-between bg-[#121212] w-full h-[70px] sm:h-[85px] pr-3 sm:pr-6 relative gap-2 sm:gap-4 shrink-0"
  >
    <div class="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
      <button
        v-if="showMobileMenuButton"
        @click="emit('toggleMenu')"
        class="lg:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 cursor-pointer shrink-0 transition-colors"
        aria-label="Abrir Menu"
      >
        <FontAwesomeIcon :icon="faBars" class="h-5 w-5" />
      </button>

      <Input
        v-if="searchInput"
        leftIcon="faMagnifyingGlass"
        class="w-full max-w-[700px]"
        text="Pesquisar..."
        v-model="query"
      />
    </div>

    <div class="shrink-0">
      <img
        :src="user?.avatarUrl || UserImage"
        class="profile-avatar cursor-pointer rounded-full object-cover size-10 sm:size-[50px] border border-white/10"
        @click="popup = !popup"
        alt="User Avatar"
      />
    </div>

    <div
      v-if="popup"
      ref="popupRef"
      class="absolute right-3 sm:right-8 top-[75px] sm:top-[95px] w-[calc(100vw-24px)] max-w-[320px] bg-[#1f1f1f] rounded-2xl sm:rounded-[28px] p-4 sm:p-5 pb-10 sm:pb-10 flex flex-col items-center shadow-2xl z-50 border border-[#333]"
    >
      <div class="w-full flex justify-end">
        <div
          class="p-1 hover:bg-gray-800 rounded-full cursor-pointer transition-colors"
          @click="popup = false"
        >
          <FontAwesomeIcon :icon="faXmark" class="text-gray-400 h-5 w-5" />
        </div>
      </div>

      <div class="relative mt-1 sm:mt-2">
        <img
          :src="user?.avatarUrl || UserImage"
          class="rounded-full size-20 sm:size-[80px] object-cover border border-white/10"
        />
      </div>

      <h2 class="text-white text-lg sm:text-xl mt-3 sm:mt-4 font-normal text-center truncate w-full px-2">
        Olá, {{ user?.name }}!
      </h2>

      <button
        @click="router.push({ name: 'profile' }); popup = false;"
        class="cursor-pointer mt-4 sm:mt-5 px-5 sm:px-6 py-2 border border-[#444] rounded-full text-[#22c55e] text-[13px] sm:text-sm font-medium hover:bg-gray-800 transition-all duration-200"
      >
        Gerenciar sua Conta
      </button>
    </div>
  </div>
</template>

