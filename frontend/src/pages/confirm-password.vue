<script setup lang="ts">
import { ref, onMounted } from "vue";
import { router } from "../router";
import LoadingSpinner from '../components/loading-spinner.vue';
import Container from '../components/container.vue';
import MessageError from "../components/message-error.vue";
import BgContainer from "../components/bg-container.vue";

interface Props {
    token: string
}

const props = defineProps<Props>();

const password = ref<string>("");
const confirmPassword = ref<string>("");
const loading = ref<boolean>(true);
const success = ref<boolean>(false);
const showInput = ref<boolean>(false);

onMounted(async () => {
    try {
        const result = await fetch(`http://localhost:3000/confirmEmail/${props.token}`, {
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

    try {
        const result = await fetch(`http://localhost:3000/resetPassword/${props.token}`, {
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
        console.log("Erro ao enviar a senha: ", error)
        errors[2]?.classList.remove("hidden");
    }
} 
</script>

<template>
    <Container>
        <BgContainer class="flex flex-col items-center justify-center max-w-[700px] p-15 py-13 pt-14">
            <div v-if="loading">
                <LoadingSpinner />
                <p class="mt-8 text-center text-[18px] text-gray-400">Verificando suas informações...</p>
            </div>

            <div class="w-full" v-else>
                <div class="w-full flex flex-col items-center justify-center" v-if="showInput">
                    <h1 class="mb-6 text-[18px]">Escreva abaixo a nova senha</h1>

                    <MessageError>Prencha os campos!</MessageError>
                    <MessageError>As senhas devem ser iguais!</MessageError>
                    <MessageError>Algo de errado aconteceu!</MessageError>

                    <Input class="mt-5 ww-full" text="Senha" :password="true" v-model="password">
                    <template v-slot:leftImage>
                        <svg xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                    </template>

                    <template v-slot:eyeOpen>
                        <svg class="cursor-pointer h-5 w-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round"
                                stroke-linejoin="round" transform="translate(2 10)">
                                <path
                                    d="m0 .5c2.53705308 3.66666667 5.37038642 5.5 8.5 5.5 3.1296136 0 5.9629469-1.83333333 8.5-5.5" />
                                <path d="m2.5 3.423-2 2.077" />
                                <path d="m14.5 3.423 2 2.077" />
                                <path d="m10.5 6 1 2.5" />
                                <path d="m6.5 6-1 2.5" />
                            </g>
                        </svg>
                    </template>

                    <template v-slot:eyeClosed>
                        <svg xmlns="http://www.w3.org/2000/svg" class="cursor-pointer h-5 w-5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </template>
                    </Input>

                    <Input class="mt-5 ww-full" text="Confirmar Senha" :password="true" v-model="confirmPassword">
                    <template v-slot:leftImage>
                        <svg xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                    </template>

                    <template v-slot:eyeOpen>
                        <svg class="cursor-pointer h-5 w-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round"
                                stroke-linejoin="round" transform="translate(2 10)">
                                <path
                                    d="m0 .5c2.53705308 3.66666667 5.37038642 5.5 8.5 5.5 3.1296136 0 5.9629469-1.83333333 8.5-5.5" />
                                <path d="m2.5 3.423-2 2.077" />
                                <path d="m14.5 3.423 2 2.077" />
                                <path d="m10.5 6 1 2.5" />
                                <path d="m6.5 6-1 2.5" />
                            </g>
                        </svg>
                    </template>

                    <template v-slot:eyeClosed>
                        <svg xmlns="http://www.w3.org/2000/svg" class="cursor-pointer h-5 w-5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </template>
                    </Input>

                    <button type="button" @click="changePassword()"
                        class="mt-6 cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">Solicitar
                        Alteração
                    </button>
                </div>

                <div v-else>
                    <div class="flex flex-col items-center justify-center" v-if="success">
                        <img class="size-[200px] mb-6" src="../assets/success.png" alt="success">
                        <p class="text-center text-[20px]">Senha alterada com sucesso! Você será redirecionado para o
                            login
                            em breve.</p>
                    </div>

                    <div class="flex flex-col items-center justify-center" v-else>
                        <img class="size-[200px] mb-6" src="../assets/fail.png" alt="error">
                        <p class="text-center text-[20px]">Algo inesperado aconteceu, tente realizar a alteração de
                            senha
                            novamente.</p>
                    </div>
                </div>
            </div>
        </BgContainer>
    </Container>
</template>