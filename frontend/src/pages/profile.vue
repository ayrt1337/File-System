<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MainPageTemplate from '../components/main-page-template.vue';
import UserImage from '../assets/981d6b2e0ccb5e968a0618c8d47671da.jpg';
import Input from '../components/input.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCamera, faEnvelope, faUser } from '@fortawesome/free-regular-svg-icons';

const loading = ref<boolean>(true);
const error = ref<boolean>(false);
const unauthorized = ref<boolean>(false);
const user = ref<any>({});

onMounted(async () => {
    try {
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + `/profile`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include"
        });

        user.value = await result.json();

        if (result.status == 403) {
            unauthorized.value = true;
        }
        else if (result.status !== 200) {
            error.value = true;
        }

        loading.value = false;
    } catch (messageError) {
        console.log("Erro em iniciar página: ", messageError);
        error.value = true;
        loading.value = false;
    }
})
</script>

<template>
    <MainPageTemplate
        :user="user"
        title=""
        :sidebar="true"
        :header="false"
        :loading="loading"
        :error="error"
        :unauthorized="unauthorized"
    >
        <div class="mt-[20px] ml-[25px] text-[#ffffff]">
            <div>
                <h2 class="text-[20px] text-white font-medium">Foto de Perfil</h2>
                
                <div class="relative w-fit mt-2">
                    <img :src="user.profileImg || UserImage" class="cursor-pointer mt-[10px] rounded-full size-[120px] object-cover">
                    <div class="absolute bottom-[0px] right-[0px] cursor-pointer">
                        <FontAwesomeIcon :icon="faCamera" class="scale-y-112 scale-x-103 rounded-full bg-[#1f1f1f] p-2 border border-[#333] hover:bg-gray-800 transition-colors text-[20px] text-[#a8c7fa]" />
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-[60px] ml-[25px] text-[#ffffff]">
            <h2 class="text-[20px] mb-3 text-white font-medium">Email</h2>

            <Input class="max-w-[500px]"  
                v-model="user.email"
            >
                <template v-slot:leftImage>
                    <FontAwesomeIcon :icon="faEnvelope" class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                </template>
            </Input>
        </div>

        <div class="mt-[50px] ml-[25px] text-[#ffffff]">
            <h2 class="text-[20px] mb-3 text-white font-medium">Nome</h2>

            <Input class="max-w-[500px]"  
                v-model="user.name"
            >
                <template v-slot:leftImage>
                    <FontAwesomeIcon :icon="faUser" class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                </template>
            </Input>
        </div>
    </MainPageTemplate>
</template>