<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
import LoadingSpinner from '../components/loading-spinner.vue';
import Container from '../components/container.vue';
import { ref, provide, watch } from 'vue';

interface Props {
    header: boolean,
    sidebar: boolean,
    loading?: boolean
}

const props = defineProps<Props>();

const loadingState = ref<boolean>(props.loading ?? true);

watch(() => props.loading, (newVal) => {
    if (newVal !== undefined) {
        loadingState.value = newVal;
    }
});

const updateLoading = (newLoading: any) => {
    console.log(newLoading)

    if (!newLoading.error) {
        loadingState.value = newLoading.loading;
        return;
    }
    
    // POPUP DE ERRO
};

provide('updateLoading', updateLoading);
</script>

<template>
    <Container v-if="loadingState">
        <LoadingSpinner />
    </Container>

    <div v-else class="flex h-screen bg-[#121212]">
        <Sidebar v-if="sidebar" @update-loading="updateLoading" />

        <div class="h-screen flex flex-col w-full">
            <Header v-if="header" />

            <slot />
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