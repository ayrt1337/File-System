<script setup lang="ts">
import Input from './input.vue';
import { ref } from 'vue';
import UserImage from '../assets/981d6b2e0ccb5e968a0618c8d47671da.jpg';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const search = ref<string>('');
</script>

<template>
    <div class="flex items-center justify-between bg-[#121212] w-full h-[100px]">
        <Input class="w-full max-w-[700px]" text="Pesquisar" v-model="search">
            <template v-slot:leftImage>
                <FontAwesomeIcon :icon="faMagnifyingGlass" class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
            </template>
        </Input>

        <div class="mr-8">
            <img :src="UserImage" class="cursor-pointer rounded-[50%]" height="50px" width="50px">
        </div>
    </div>
</template>