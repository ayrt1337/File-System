<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFile, faStar } from '@fortawesome/free-regular-svg-icons';
import { faUsers, faArrowRightArrowLeft, faTrash, faArrowRightFromBracket, faDownload, faGear, faUser } from '@fortawesome/free-solid-svg-icons';
import { getFilePreview } from '../utils/get-file-preview';
import { router } from '../router';
import { useRoute } from 'vue-router';
import { useLoading } from '../composables/use-loading';
import { useToast } from '../composables/use-toast';
import { api } from '../services/api';
import { useAuthStore } from '../stores/auth';

interface Props {
    getFiles?: () => Promise<void>;
}

const props = defineProps<Props>();

const authStore = useAuthStore();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const route = useRoute();

const handleLogout = async () => {
    showLoadingPage(true);

    try {
        await api.get('/logout');
        authStore.logout();
        router.push("/login");
    } catch (error) {
        console.error("Erro em deslogar: ", error);
        showLoadingPage(false);
        showToast("Algo deu errado!", "error");
    }
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

const triggerFileInput = () => {
    fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    isUploading.value = true;

    try {
        const filePreview = await getFilePreview(file);
        const { data } = await api.post("/upload-url", {
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            preview: filePreview
        });

        await axios.put(data.url, file, {
            headers: {
                "Content-Type": file.type,
            },
        });

        if (props.getFiles) await props.getFiles();

        showToast("Arquivo enviado com sucesso!", "success");
    } catch (error) {
        console.error("Erro no upload do arquivo:", error);
        showToast("Falha ao enviar arquivo.", "error");
    } finally {
        isUploading.value = false;
        if (fileInputRef.value) {
            fileInputRef.value.value = "";
        }
    }
};
</script>

<template>
    <div class="flex flex-col justify-between py-8 px-7 text-[#cccccc] top-0 left-0 bg-[#121212] min-h-[100vh] max-w-[320px] w-full">
        <div>
            <div>
                <p class="text-[20px]">MyFileSystem</p>
            </div>

            <div 
                @click="!isUploading ? triggerFileInput() : null" 
                :class="[
                    isUploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
                    'w-auto py-4 px-7 mt-5 inline-block bg-[#363333ac] rounded-[10px] select-none transition-all duration-300'
                ]"
            >
                <div class="flex items-center">
                    <p v-if="!isUploading" class="text-[30px] mr-3">+</p>
                    <div v-else class="mr-3 animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <p class="text-[25px]">{{ isUploading ? "Enviando..." : "Novo" }}</p>
                </div>
            </div>
            <input 
                type="file" 
                ref="fileInputRef" 
                style="display: none" 
                @change="handleFileChange" 
            />

            <div class="flex flex-col mt-10">
                <div
                    @click="!route.path.startsWith('/my-files') ? router.push({ name: 'myFiles' }) : null"
                    :style="route.path.startsWith('/my-files') ? 'background-color: #009900; color: white;' : ''"
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
                    @click="!route.path.startsWith('/favorites') ? router.push({ name: 'favorites' }) : null"
                    :style="route.path.startsWith('/favorites') ? 'background-color: #009900; color: white;' : ''"
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faStar" />
                    <p>Favoritos</p>
                </div>
            </div>

            <div class="flex flex-col mt-10">
                <div
                    @click="!route.path.startsWith('/convert-files') ? router.push({ name: 'convertFilesOptions' }) : null"
                    :style="route.path.startsWith('/convert-files') ? 'background-color: #009900; color: white;' : ''"
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faArrowRightArrowLeft" />
                    <p>Converter Arquivos</p>
                </div>

                <div
                    @click="!route.path.startsWith('/download-videos') ? router.push({ name: 'downloadVideosOptions' }) : null"
                    :style="route.path.startsWith('/download-videos') ? 'background-color: #009900; color: white;' : ''"
                    class="gap-2 py-2 px-3 hover:bg-[#363333ac] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex items-center">
                    <FontAwesomeIcon :icon="faDownload" />
                    <p>Baixar Vídeos</p>
                </div>

                <div
                    @click="!route.path.startsWith('/trash') ? router.push({ name: 'trash' }) : null"
                    :style="route.path.startsWith('/trash') ? 'background-color: #009900; color: white;' : ''"
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
                    @click="!route.path.startsWith('/profile') ? router.push({ name: 'profile' }) : null"
                    :style="route.path.startsWith('/profile') ? 'background-color: #009900; color: white;' : ''"
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