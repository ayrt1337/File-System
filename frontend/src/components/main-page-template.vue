<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
import LoadingSpinner from '../components/loading-spinner.vue';
import { ref, watch } from 'vue';
import ServerError from './server-error.vue';
import Unauthorized from './unauthorized.vue';
import Popup from './popup.vue';

interface Props {
    user: any,
    header: boolean,
    sidebar: boolean,
    title: string,
    loading?: boolean,
    error?: boolean,
    errorOverlay?: boolean,
    successOverlay?: boolean,
    unauthorized?: boolean
};

const props = defineProps<Props>();

const loadingState = ref<boolean>(props.loading ?? true);
const errorState = ref<boolean>(props.error ?? false);
const unauthorizedState = ref<boolean>(props.unauthorized ?? false);
const errorOverlayState = ref<boolean>(props.errorOverlay ?? false);
const successOverlayState = ref<boolean>(props.successOverlay ?? false);

watch(() => ([props.loading, props.error, props.unauthorized, props.errorOverlay, props.successOverlay]), 
            ([newLoading, newError, newUnauthorized, newErrorOverlay, newSuccessOverlay]) => {
    if (newLoading !== undefined) {
        loadingState.value = newLoading;
    }

    if (newError) {
        errorState.value = newError;
    }

    if (newUnauthorized) {
        unauthorizedState.value = newUnauthorized;
    }

    if (newErrorOverlay) {
        errorOverlayState.value = newErrorOverlay;

        setTimeout(() => {
            errorOverlayState.value = false;
        }, 3000);
    }

    if (newSuccessOverlay) {
        successOverlayState.value = newSuccessOverlay;

        setTimeout(() => {
            successOverlayState.value = false;
        }, 3000);
    }
});

const updateLoading = (newLoading: any) => {
    loadingState.value = newLoading.loading;

    if (newLoading.error) {
        errorOverlayState.value = true;

        setTimeout(() => {
            errorOverlayState.value = false;
        }, 3000);
    }
};
</script>

<template>
    <ServerError v-if="!loadingState && errorState" />
    <Unauthorized v-else-if="!loadingState && unauthorizedState" />

    <div v-else>
        <Transition name="popup">
            <Popup v-if="errorOverlayState" type="error" />
            <Popup v-else-if="successOverlayState" type="success" />
        </Transition>

        <LoadingSpinner v-show="loadingState" />
    
        <div v-show="!loadingState" class="flex h-screen bg-[#121212]">
            <Sidebar v-if="sidebar" @update-loading="updateLoading"/>

            <div class="h-screen flex flex-col w-full">
                <Header :user="user" v-if="header" />

                <div :class="(!header ? 'mt-[85px] ' : '') + 'flex flex-1 flex-col bg-[#1e1e1e] rounded-[24px] mr-8 mb-8 min-h-0'">
                    <h1 v-if="title" class="pt-8 px-8 text-[24px] text-white font-medium">{{ title }}</h1>

                    <div class="overflow-y-auto mt-6 px-8 custom-scrollbar">
                        <slot />
                    </div>
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