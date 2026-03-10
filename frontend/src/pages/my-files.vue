<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
import LoadingSpinner from '../components/loading-spinner.vue';
import Container from '../components/container.vue';
import { onMounted, ref } from 'vue';
import { router } from '../router';

const loading = ref<boolean>(true);

onMounted(async () => {
    const result = await fetch("http://localhost:3000/my-files", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        credentials: "include"
    });

    if (result.status !== 200) {
        alert("Você não possui permissão para acessar essa página!");
        router.push("/login");
        return;
    }

    loading.value = false;
})

const updateLoading = (newLoading: boolean) => {
    loading.value = newLoading;
};
</script>

<template>
    <Container v-if="loading">
        <LoadingSpinner />
    </Container>

    <div v-else class="flex h-screen bg-[#121212]">
        <Sidebar @update-loading="updateLoading" />

        <div class="h-screen flex flex-col w-full">
            <Header />

            <div class="flex flex-1 flex-col bg-[#1e1e1e] rounded-[24px] mr-8 mb-8 min-h-0">
                <h1 class="pt-8 px-8 text-[24px] text-white font-medium mb-6">Meus Arquivos</h1>

                <div class="overflow-y-auto px-8 custom-scrollbar">

                </div>
            </div>
        </div>
    </div>
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