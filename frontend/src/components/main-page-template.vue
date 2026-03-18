<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
import LoadingSpinner from '../components/loading-spinner.vue';
import { ref, watch } from 'vue';
import ServerError from './server-error.vue';
import Unauthorized from './unauthorized.vue';

interface Props {
    user: any,
    header: boolean,
    sidebar: boolean,
    title: string,
    loading?: boolean,
    error?: boolean,
    unauthorized?: boolean
};

const props = defineProps<Props>();

const loadingState = ref<boolean>(props.loading ?? true);
const errorState = ref<boolean>(props.error ?? false);
const unauthorizedState = ref<boolean>(props.unauthorized ?? false);

watch(() => ([props.loading, props.error, props.unauthorized]), ([newLoading, newError, newUnauthorized]) => {
    if (newLoading !== undefined) {
        loadingState.value = newLoading;
    }

    if (newError !== undefined) {
        errorState.value = newError;
    }

    if (newUnauthorized !== undefined) {
        unauthorizedState.value = newUnauthorized;
    }
});

const updateLoading = (newLoading: any) => {
    if (!newLoading.error) {
        loadingState.value = newLoading.loading;
        return;
    }
    
    // POPUP DE ERRO
};
</script>

<template>
    <LoadingSpinner v-if="loadingState" />
    <ServerError v-else-if="!loadingState && errorState" />
    <Unauthorized v-else-if="!loadingState && unauthorizedState" />

    <div v-else class="flex h-screen bg-[#121212]">
        <Sidebar v-if="sidebar" @update-loading="updateLoading"/>

        <div class="h-screen flex flex-col w-full">
            <Header :user="user.name" v-if="header" />

            <div :class="(!header ? 'mt-[85px] ' : '') + 'flex flex-1 flex-col bg-[#1e1e1e] rounded-[24px] mr-8 mb-8 min-h-0'">
                <h1 v-if="title" class="pt-8 px-8 text-[24px] text-white font-medium">{{ title }}</h1>

                <div class="overflow-y-auto mt-6 px-8 custom-scrollbar">
                    <slot />
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