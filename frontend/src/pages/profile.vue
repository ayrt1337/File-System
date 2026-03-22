<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MainPageTemplate from '../components/main-page-template.vue';
import UserImage from '../assets/981d6b2e0ccb5e968a0618c8d47671da.jpg';
import Input from '../components/input.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCamera, faUser } from '@fortawesome/free-regular-svg-icons';
import { faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { router } from '../router';
import Overlay from '../components/overlay.vue';

const loading = ref<boolean>(true);
const error = ref<boolean>(false);
const unauthorized = ref<boolean>(false);
const user = ref<any>({});
const inputLoading = ref<boolean>(false);
const errorOverlay = ref<boolean>(false);
const successOverlay = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

onMounted(async () => {
    try {
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + `/profile`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include"
        });

        user.value = await result.json();

        if (result.status == 403) {
            unauthorized.value = true;
        }
        else if (result.status !== 200) {
            error.value = true;
        }

        loading.value = false;
    } catch (messageError) {
        console.log("Erro em iniciar página: ", messageError);
        error.value = true;
        loading.value = false;
    }
})

const handleUpdate = async () => {
    inputLoading.value = true;
    const name = user.value.name;

    try {
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + "/update", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ name })
        });

        if (result.status === 200) {
            successOverlay.value = true;

            setTimeout(() => {
                successOverlay.value = false;
            }, 3000);
        }
        else {
            errorOverlay.value = true;

            setTimeout(() => {
                errorOverlay.value = false;
            }, 3000);
        }
    } catch (error) {
        console.log("Erro ao atualizar os dados: ", error);
        errorOverlay.value = true;

        setTimeout(() => {
            errorOverlay.value = false;
        }, 3000);
    } finally {
        inputLoading.value = false;
    }
}

const confirmDelete = async () => {
    showDeleteConfirm.value = false;
    inputLoading.value = true;
    
    try {
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + "/delete", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include",
        });

        if (result.status === 200) {
            router.push("/login");
        }
        else {
            errorOverlay.value = true;

            setTimeout(() => {
                errorOverlay.value = false;
            }, 3000);
        }
    } catch (error) {
        console.log("Erro ao atualizar os dados: ", error);
        errorOverlay.value = true;

        setTimeout(() => {
            errorOverlay.value = false;
        }, 3000);
    } finally {
        inputLoading.value = false;
    }
}
</script>

<template>
    <MainPageTemplate
        :user="user"
        title=""
        :sidebar="true"
        :header="false"
        :loading="loading"
        :error="error"
        :errorOverlay="errorOverlay"
        :successOverlay="successOverlay"
        :unauthorized="unauthorized"
    >   

        <div class="mt-[20px] ml-[25px] text-[#ffffff]">
            <Overlay v-if="showDeleteConfirm">
                <Transition name="modal-fade" appear>
                    <div class="relative bg-[#1a1a1a] border border-[#333] w-full max-w-[400px] rounded-[24px] p-8 shadow-2xl overflow-hidden">
                        <div class="flex flex-col items-center text-center">
                            <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                                <FontAwesomeIcon :icon="faTriangleExclamation" class="text-3xl text-red-500" />
                            </div>
                            
                            <h3 class="text-xl font-bold text-white mb-2">Excluir Conta?</h3>
                            <p class="text-gray-400 text-sm leading-relaxed mb-8">
                                Esta ação é permanente e todos os seus dados serão removidos. Tem certeza que deseja continuar?
                            </p>
                            
                            <div class="flex gap-3 w-full">
                                <button 
                                    @click="showDeleteConfirm = false"
                                    class="cursor-pointer flex-1 px-6 py-3 rounded-full bg-[#333] hover:bg-[#444] text-white font-semibold transition-all duration-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    :disabled="inputLoading"
                                    @click="confirmDelete()"
                                    class="cursor-pointer flex-1 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-red-900/20"
                                >
                                    <FontAwesomeIcon v-if="inputLoading" :icon="faSpinner" spin />
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </Overlay>

            <div>
                <h2 class="text-[20px] font-medium">Foto de Perfil</h2>
                
                <div class="relative w-fit mt-2">
                    <img :src="user.profileImg || UserImage" class="cursor-pointer mt-[10px] rounded-full size-[120px] object-cover">
                    <div class="absolute bottom-[0px] right-[0px] cursor-pointer">
                        <FontAwesomeIcon :icon="faCamera" class="scale-y-112 scale-x-103 rounded-full bg-[#1f1f1f] p-2 border border-[#333] hover:bg-gray-800 transition-colors text-[20px] text-[#a8c7fa]" />
                    </div>
                </div>
            </div>

            <div class="mt-[60px]">
                <h2 class="text-[20px] mb-3 font-medium">Email</h2>
                <p>{{ user.email }}</p>
            </div>

            <div class="mt-[50px]">
                <h2 class="text-[20px] mb-3 font-medium">Nome</h2>

                <Input class="max-w-[500px]"  
                    v-model="user.name"
                >
                    <template v-slot:leftImage>
                        <FontAwesomeIcon :icon="faUser" class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                    </template>
                </Input>
            </div>

            <div class="flex mt-[50px]">
                <div class="mr-3">
                    <button @click="handleUpdate()" type="submit" :disabled="inputLoading" class="cursor-pointer text-[15px] flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                        <FontAwesomeIcon v-if="inputLoading" :icon="faSpinner" spin />
                        Salvar Alterações
                    </button>
                </div>

                <div>
                    <button @click="showDeleteConfirm = true" type="submit" class="cursor-pointer flex-1 bg-red-600 hover:bg-red-500 text-black font-bold text-[15px] py-2.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                        Excluir Conta
                    </button>
                </div>
            </div>
        </div>
    </MainPageTemplate>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}
</style>