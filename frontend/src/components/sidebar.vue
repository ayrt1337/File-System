<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFile, faStar } from '@fortawesome/free-regular-svg-icons';
import { faUsers, faArrowRightArrowLeft, faTrash, faArrowRightFromBracket, faDownload, faGear, faUser } from '@fortawesome/free-solid-svg-icons';
import { router } from '../router';
import { useRoute } from 'vue-router';

const route = useRoute();
const emit = defineEmits(['update-loading']);

const handleLogout = async () => {
    emit('update-loading', { loading: true, error: false });

    // const result = await fetch(import.meta.env.VITE_API_BASE_URL + '/logout', {
    //     method: "GET",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Accept": "application/json"
    //     },
    //     credentials: "include"
    // });

    // const output = await result.json();

    // if (output == "success") {
    //    router.push("/login");
    // }
    // else {
    //     emit('update-loading', { loading: false, error: true });
    // }

    emit('update-loading', { loading: false, error: false });
}
</script>

<template>
    <div class="flex flex-col justify-between py-8 px-7 text-[#cccccc] top-0 left-0 bg-[#121212] min-h-[100vh] max-w-[320px] w-full">
        <div>
            <div>
                <p class="text-[20px]">MyFileSystem</p>
            </div>

            <div class="cursor-pointer w-auto py-4 px-7 mt-5 inline-block bg-[#363333ac] rounded-[10px]">
                <div class="flex items-center">
                    <p class="text-[30px] mr-3">+</p>
                    <p class="text-[25px]">Novo</p>
                </div>
            </div>

            <div class="flex flex-col mt-10">
                <div
                    @click="router.push({ name: 'myFiles' })"
                    :style="route.path == '/my-files' ? 'background-color: #009900; color: white;' : ''"
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faFile" />
                    <p>Meus Arquivos</p>
                </div>

                <div
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faUsers" />
                    <p>Arquivos Compartilhados</p>
                </div>

                <div
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faStar" />
                    <p>Favoritos</p>
                </div>
            </div>

            <div class="flex flex-col mt-10">
                <div
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faArrowRightArrowLeft" />
                    <p>Converter Arquivos</p>
                </div>

                <div
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faDownload" />
                    <p>Baixar Vídeos</p>
                </div>

                <div
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faTrash" />
                    <p>Lixeira</p>
                </div>
            </div>

            <div class="flex flex-col mt-10">
                <div
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faGear" />
                    <p>Configurações</p>
                </div>

                <div
                    @click="router.push({ name: 'profile' })"
                    :style="route.path == '/profile' ? 'background-color: #009900; color: white;' : ''"
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faUser" />
                    <p>Perfil</p>
                </div>
            </div>
        </div>

        <div @click="handleLogout()" class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
            <FontAwesomeIcon :icon="faArrowRightFromBracket" />
            <p>Sair</p>
        </div>
    </div>
</template>