<script setup lang="ts">
import MainPageTemplate from '../../components/main-page-template.vue';
import { onMounted } from 'vue';
import { api } from '../../services/api';
import { verifyApiError } from '../../services/verify-api-error';

onMounted(async () => {
    try {
        await api.get(`/my-files`);
    } catch (error: any) {
        console.log("Erro em iniciar página: ", error);
        verifyApiError(error.response?.status);
    }
})
</script>

<template>
    <MainPageTemplate
        :header="true"
        :sidebar="true"
        title="Meus Arquivos"
    >
    
    </MainPageTemplate>
</template>