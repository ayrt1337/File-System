<script setup lang="ts">
import Input from './input.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import UserImage from '../assets/981d6b2e0ccb5e968a0618c8d47671da.jpg';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMagnifyingGlass, faXmark, faCamera } from '@fortawesome/free-solid-svg-icons';
import { router } from '../router';

interface Props {
    user: any
};

const props = defineProps<Props>();

const search = ref<string>('');
const popup = ref<boolean>(false);
const popupRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const avatarImage = document.querySelector('.profile-avatar');
    
    if (popup.value && 
        popupRef.value && 
        !popupRef.value.contains(target) && 
        avatarImage && 
        !avatarImage.contains(target)) {
        popup.value = false;
    }
};

onMounted(() => {
    window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="flex items-center justify-between bg-[#121212] w-full h-[85px] relative">
        <Input class="w-full max-w-[700px]" text="Pesquisar" v-model="search">
            <template v-slot:leftImage>
                <FontAwesomeIcon :icon="faMagnifyingGlass" class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
            </template>
        </Input>

        <div class="mr-8">
            <img :src="UserImage" class="profile-avatar cursor-pointer rounded-[50%] object-cover" height="50px" width="50px" @click="popup = !popup">
        </div>

        <div v-if="popup" ref="popupRef" class="absolute right-8 top-[100px] w-[350px] bg-[#1f1f1f] rounded-[28px] p-5 pb-10 flex flex-col items-center shadow-2xl z-50 border border-[#333]">
            <div class="w-full flex justify-end">
                <div class="p-1 hover:bg-gray-800 rounded-full cursor-pointer transition-colors" @click="popup = false">
                    <FontAwesomeIcon :icon="faXmark" class="text-gray-400 h-5 w-5" />
                </div>
            </div>
            
            <div class="relative mt-2">
                <img :src="user.profileImg || UserImage" class="rounded-full size-[80px] object-cover" />
                <div class="absolute bottom-[-4px] right-[-4px] cursor-pointer">
                    <FontAwesomeIcon :icon="faCamera" class="scale-y-110 rounded-full bg-[#1f1f1f] p-2 border border-[#333] hover:bg-gray-800 transition-colors text-xs text-[#a8c7fa]" />
                </div>
            </div>

            <h2 class="text-white text-xl mt-4 font-normal">Olá, {{ user.name }}!</h2>
            
            <button
                @click="router.push({ name: 'profile' })"
                class="cursor-pointer mt-5 px-6 py-2 border border-[#444] rounded-full text-[#a8c7fa] text-sm font-medium hover:bg-gray-800 transition-all duration-200">
                Gerenciar sua Conta
            </button>
        </div>
    </div>
</template>