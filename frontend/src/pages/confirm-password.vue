<script setup lang="ts">
import { ref, onMounted } from "vue";
import { router } from "../router";
import LoadingSpinner from '../components/loading-spinner.vue';
import Container from '../components/container.vue';
import MessageError from "../components/message-error.vue";
import BgContainer from "../components/bg-container.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from "../components/input.vue";
import SuccessImage from '../assets/success.png';
import FailImage from '../assets/fail.png';

interface Props {
    token: string
};

const props = defineProps<Props>();

const password = ref<string>("");
const confirmPassword = ref<string>("");
const loading = ref<boolean>(true);
const inputLoading = ref<boolean>(false);
const success = ref<boolean>(false);
const showInput = ref<boolean>(false);

onMounted(async () => {
    try {
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + `/confirmEmail/${props.token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        const output = await result.json();

        if (output == "success") {
            showInput.value = true;
            loading.value = false;
        }
        else {
            loading.value = false;
        }
    } catch (error) {
        console.error("Erro na verificação do token: ", error);
        loading.value = false;
    }
})

const changePassword = async () => {
    const errors = document.getElementsByClassName("error");

    for (const error of errors) {
        error.classList.add("hidden");
    }

    if (password.value == "" || confirmPassword.value == "") {
        errors[0]?.classList.remove("hidden");
        return;
    }

    if (password.value != confirmPassword.value) {
        errors[1]?.classList.remove("hidden");
        return;
    }

    inputLoading.value = true;
    try {
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + `/resetPassword/${props.token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ token: props.token, password: password.value })
        })

        const output = await result.json();

        if (output == "success") {
            success.value = true;
            showInput.value = false;

            setTimeout(() => {
                router.push("/login");
            }, 2000)
        }
        else {
            success.value = false;
            showInput.value = false;
        }
    } catch (error) {
        console.log("Erro ao enviar a senha: ", error);
        inputLoading.value = false;
        errors[2]?.classList.remove("hidden");
    }
} 
</script>

<template>
    <LoadingSpinner v-if="loading" />

    <Container v-else>
        <BgContainer class="flex flex-col items-center justify-center max-w-[700px] p-15 py-13 pt-14">
            <div class="w-full">
                <div class="w-full flex flex-col items-center justify-center" v-if="showInput">
                    <h1 class="mb-6 text-[18px]">Escreva abaixo a nova senha</h1>

                    <MessageError>Prencha os campos!</MessageError>
                    <MessageError>As senhas devem ser iguais!</MessageError>
                    <MessageError>Algo de errado aconteceu!</MessageError>

                    <Input class="mt-5 w-full" text="Senha" :password="true" v-model="password">
                        <template v-slot:leftImage>
                            <FontAwesomeIcon :icon="faLock" class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                        </template>

                        <template v-slot:eyeClosed>
                            <FontAwesomeIcon :icon="faEyeSlash" class="cursor-pointer hover:text-[#22c55e] h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                        </template>

                        <template v-slot:eyeOpen>
                            <FontAwesomeIcon :icon="faEye" class="cursor-pointer hover:text-[#22c55e] h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                        </template>
                    </Input>

                    <Input class="mt-5 w-full" text="Confirmar Senha" :password="true" v-model="confirmPassword">
                        <template v-slot:leftImage>
                            <FontAwesomeIcon :icon="faLock" class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                        </template>

                        <template v-slot:eyeClosed>
                            <FontAwesomeIcon :icon="faEyeSlash" class="cursor-pointer hover:text-[#22c55e] h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                        </template>

                        <template v-slot:eyeOpen>
                            <FontAwesomeIcon :icon="faEye" class="cursor-pointer hover:text-[#22c55e] h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                        </template>
                    </Input>

                    <button type="button" :disabled="inputLoading" @click="changePassword()" class="disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6 cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">
                        <FontAwesomeIcon v-if="inputLoading" :icon="faSpinner" spin />
                        Solicitar Alteração
                    </button>
                </div>

                <div v-else>
                    <div class="flex flex-col items-center justify-center" v-if="success">
                        <img class="size-[200px] mb-6" :src="SuccessImage" alt="success">
                        <p class="text-center text-[20px]">Senha alterada com sucesso! Você será redirecionado para o login em breve.</p>
                    </div>

                    <div class="flex flex-col items-center justify-center" v-else>
                        <img class="size-[200px] mb-6" :src="FailImage" alt="error">
                        <p class="text-center text-[20px]">Algo inesperado aconteceu, tente realizar a alteração de senha novamente.</p>
                    </div>
                </div>
            </div>
        </BgContainer>
    </Container>
</template>