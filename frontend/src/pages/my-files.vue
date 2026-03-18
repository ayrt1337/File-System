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
        title="Meus Arquivos"
        :loading="loading"
        :error="error"
        :unauthorized="unauthorized"
    >
    
    </MainPageTemplate>
</template>