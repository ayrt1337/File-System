<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Overlay from "./overlay.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faLock,
  faChevronDown,
  faCircleQuestion,
  faGear,
  faLink,
  faGlobe,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "../stores/auth.ts";
import type { UserFile } from "../types/file.ts";

const props = defineProps<{
  isOpen: boolean;
  file: UserFile | null;
  close: () => void;
}>();

const authStore = useAuthStore();
const user = computed(() => authStore.getUser);

const generalAccess = ref<'restricted' | 'public'>('restricted');
const isAccessDropdownOpen = ref(false);
const isCopied = ref(false);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isCopied.value = false;
    isAccessDropdownOpen.value = false;
  }
});

const shareUrl = computed(() => {
  if (!props.file) return "";
  return `${window.location.origin}/share/${props.file.id}`;
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

const selectAccess = (type: 'restricted' | 'public') => {
  generalAccess.value = type;
  isAccessDropdownOpen.value = false;
};
</script>

<template>
  <Overlay v-if="isOpen && file">
    <Transition name="modal-fade" appear>
      <div 
        @click.stop
        class="bg-[#1e1e1e] border border-white/10 rounded-3xl w-full max-w-[550px] p-6 relative shadow-2xl text-left"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-white text-[20px] font-normal leading-normal select-none">
            Compartilhar "{{ file.name }}"
          </h3>
          <div class="flex items-center gap-4 text-gray-400">
            <button class="hover:text-white cursor-pointer transition-colors p-1" title="Ajuda">
              <FontAwesomeIcon :icon="faCircleQuestion" class="w-[18px] h-[18px]" />
            </button>
            <button class="hover:text-white cursor-pointer transition-colors p-1" title="Configurações">
              <FontAwesomeIcon :icon="faGear" class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
        
        <div class="border border-white/20 rounded-lg p-3 bg-transparent text-gray-500 text-sm select-none mb-6 cursor-text hover:border-white/30 transition-colors">
          Adicionar participantes, grupos, espaços e eventos da ag...
        </div>
        
        <div class="mb-6">
          <h4 class="text-white text-[15px] font-medium mb-3 select-none">Pessoas com acesso</h4>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-[36px] h-[36px] rounded-full bg-[#d81b60] flex items-center justify-center text-white font-semibold text-[15px] uppercase select-none">
                {{ user?.name ? user.name.charAt(0).toLowerCase() : 'a' }}
              </div>
              <div class="flex flex-col">
                <span class="text-white text-sm font-normal">{{ user?.name || 'ayrt' }} (você)</span>
                <span class="text-gray-400 text-xs">{{ user?.email || 'caiodalmune@gmail.com' }}</span>
              </div>
            </div>
            <span class="text-gray-500 text-sm font-normal select-none">Proprietário</span>
          </div>
        </div>
        
        <div class="mb-8">
          <h4 class="text-white text-[15px] font-medium mb-3 select-none">Acesso geral</h4>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <div 
                class="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                :class="generalAccess === 'restricted' ? 'bg-white/10 text-white' : 'bg-[#0f5132] text-[#22c55e]'"
              >
                <FontAwesomeIcon :icon="generalAccess === 'restricted' ? faLock : faGlobe" class="text-sm" />
              </div>
              
              <div class="flex-1 flex flex-col min-w-0 relative">
                <div 
                  @click.stop="toggleAccessMenu"
                  class="flex items-center gap-1.5 text-white text-sm font-medium cursor-pointer hover:text-white/80 w-fit select-none"
                >
                  <span>{{ generalAccess === 'restricted' ? 'Restrito' : 'Qualquer pessoa com o link' }}</span>
                  <FontAwesomeIcon :icon="faChevronDown" class="text-[9px]" />
                </div>
                <span class="text-gray-400 text-xs mt-0.5 select-none">
                  {{ generalAccess === 'restricted' ? 'Só as pessoas com acesso podem abrir usando o link.' : 'Qualquer pessoa na Internet com o link pode ver' }}
                </span>
                
                <Transition name="dropdown-fade">
                  <div 
                    v-if="isAccessDropdownOpen"
                    class="absolute left-0 top-6 min-w-[240px] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 py-1.5 flex flex-col overflow-hidden text-left"
                  >
                    <button 
                      @click="selectAccess('restricted')"
                      class="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer font-medium"
                    >
                      <div class="w-4 h-4 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon v-if="generalAccess === 'restricted'" :icon="faCheck" class="text-[#22c55e] text-xs" />
                      </div>
                      <span>Restrito</span>
                    </button>
                    
                    <button 
                      @click="selectAccess('public')"
                      class="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors cursor-pointer font-medium"
                    >
                      <div class="w-4 h-4 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon v-if="generalAccess === 'public'" :icon="faCheck" class="text-[#22c55e] text-xs" />
                      </div>
                      <span>Qualquer pessoa com o link</span>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
            
            <div v-if="generalAccess === 'public'" class="shrink-0 flex items-center gap-1.5 text-white text-sm font-medium cursor-pointer hover:text-white/80 select-none mt-1">
              <span>Leitor</span>
              <FontAwesomeIcon :icon="faChevronDown" class="text-[9px]" />
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <button 
            @click="copyShareUrl"
            class="px-5 py-2.5 border border-white/20 hover:border-white/30 hover:bg-white/5 text-white text-sm font-semibold rounded-full transition-all cursor-pointer flex items-center gap-2 animate-fade-in"
          >
            <FontAwesomeIcon :icon="isCopied ? faCheck : faLink" class="text-xs" />
            <span>{{ isCopied ? "Link copiado" : "Copiar link" }}</span>
          </button>
          
          <button 
            @click="close"
            class="px-6 py-2.5 bg-[#009900] hover:bg-[#22c55e] text-white text-sm font-semibold rounded-full transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </Transition>
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
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
