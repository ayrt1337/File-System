<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
import LoadingSpinner from '../components/loading-spinner.vue';
import ServerError from './server-error.vue';
import Unauthorized from './unauthorized.vue';
import Toast from './toast.vue';
import { useLoading } from '../composables/use-loading';
import { useServerError } from '../composables/use-server-error';
import { useUnauthorized } from '../composables/use-unauthorized';

interface Props {
    header: boolean;
    sidebar: boolean;
    title: string;
    searchInput?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    searchInput: true
});

const { showLoading } = useLoading();
const { showError } = useServerError();
const { showUnauthorized } = useUnauthorized();
</script>

<template>
    <Toast />
    <LoadingSpinner v-if="showLoading" />

    <template v-else>
        <ServerError v-if="showError" />
        <Unauthorized v-else-if="showUnauthorized" />
    
        <div v-else class="flex h-screen bg-[#121212]">
            <Sidebar v-if="sidebar"/>

            <div class="h-screen flex flex-col w-full">
                <Header :search-input="searchInput" v-if="header" />

                <div :class="(!header ? 'mt-[85px] ' : '') + 'px-12 pt-10 pb-5 flex flex-1 flex-col bg-[#1e1e1e] rounded-[24px] mr-8 mb-8 min-h-0'">
                    <h1 v-if="title" class="mb-10 text-[24px] text-white font-medium">{{ title }}</h1>

                    <div class="overflow-y-auto custom-scrollbar">
                        <slot />
                    </div>
                </div>
            </div>
        </div>
    </template>
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

.popup-enter-active,
.error-pop-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-enter-from {
    opacity: 0;
    transform: translateX(50px) scale(0.9);
}

.popup-leave-to {
    opacity: 0;
    transform: translateX(20px) scale(0.95);
}
</style>