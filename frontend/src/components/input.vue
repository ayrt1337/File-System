<script setup lang="ts">
import { ref } from "vue";

interface Props {
    text: string,
    password?: boolean,
};

const props = defineProps<Props>();
const model = defineModel<string>();
const showText = ref<boolean>(false);
</script>

<template>
    <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <slot name="leftImage"></slot>
        </div>
        <input v-model.trim="model" :type="showText ? 'text' : 'password'" :placeholder="text"
            class="w-full py-3.5 pl-12 pr-12 bg-[#1a1a1a] border border-gray-800 rounded-full focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all duration-300 placeholder-gray-600 text-white" />
        <button v-if="password" type="button" @click="showText = !showText"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#22c55e] transition-colors duration-300 focus:outline-none">
            <slot v-if="showText" name="eyeClosed"></slot>
            <slot v-else name="eyeOpen"></slot>
        </button>
    </div>
</template>