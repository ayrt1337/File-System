<script setup lang="ts">
import MainPageTemplate from '../components/main-page-template.vue';
import { onMounted, ref } from 'vue';

const loading = ref<boolean>(true);
const error = ref<boolean>(false);
const unauthorized = ref<boolean>(false);
const user = ref<object>({});

onMounted(async () => {
    try {
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + `/my-files`, {
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
        :header="true"
        :sidebar="true"
        :loading="loading"
        :error="error"
        :unauthorized="unauthorized"
    >
        <div class="flex flex-1 flex-col bg-[#1e1e1e] rounded-[24px] mr-8 mb-8 min-h-0">
            <h1 class="pt-8 px-8 text-[24px] text-white font-medium mb-6">Meus Arquivos</h1>

            <div class="overflow-y-auto px-8 custom-scrollbar">

            </div>
        </div>
    </MainPageTemplate>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #444;
}
</style>