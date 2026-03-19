<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Container from '../components/container.vue';
import MessageError from '../components/message-error.vue';
import BgContainer from '../components/bg-container.vue';
import Input from '../components/input.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Image from '../assets/unnamed.jpg';

const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const loading = ref<boolean>(false);
const router = useRouter();

const handleRegister = async () => {
    const errors = document.getElementsByClassName("error");

    for (const error of errors) {
        error.classList.add("hidden");
    }

    if (email.value == "" || password.value == "" || confirmPassword.value == "") {
        errors[0]?.classList.remove("hidden");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        errors[1]?.classList.remove("hidden");
        return;
    }

    if (password.value != confirmPassword.value) {
        errors[2]?.classList.remove("hidden");
        return;
    }

    loading.value = true;
    try {
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + `/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email: email.value, password: password.value })
        });

        const output = await result.json();

        if (output == "success") {
            router.push({
                name: "email",
                state: { email: email.value, password: password.value, reason: "confirmation" }
            });
        }
        else {
            loading.value = false;
            errors[3]?.classList.remove("hidden");
        }
    } catch (error) {
        console.log("Erro no envio de email: ", error);
        loading.value = false;
        errors[3]?.classList.remove("hidden");
    }
};
</script>

<template>
    <Container>
        <BgContainer class="max-w-6xl h-[70vh] flex">
            <div
                class="w-full lg:w-1/2 pr-0 p-8 md:py-12 lg:py-16 flex flex-col justify-center relative z-20 bg-[#121212]">
                <div class="max-w-md mx-auto w-full">
                    <div class="mb-5">
                        <h1
                            class="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2 text-center">
                            Cadastrar Conta</h1>
                        <p class="text-gray-500 text-center">Junte-se a nós hoje!</p>
                    </div>

                    <MessageError>Prencha os campos!</MessageError>
                    <MessageError>Email inválido!</MessageError>
                    <MessageError>As senhas devem ser iguais!</MessageError>
                    <MessageError>Algo de errado aconteceu!</MessageError>

                    <form @submit.prevent="handleRegister" class="pt-5 space-y-6">
                        <Input text="Email" v-model="email">
                            <template v-slot:leftImage>
                                <FontAwesomeIcon :icon="faEnvelope"
                                    class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                            </template>
                        </Input>

                        <Input text="Senha" :password="true" v-model="password">
                            <template v-slot:leftImage>
                                <FontAwesomeIcon :icon="faLock"
                                    class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                            </template>

                            <template v-slot:eyeClosed>
                                <FontAwesomeIcon :icon="faEyeSlash"
                                    class="cursor-pointer hover:text-[#22c55e] h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                            </template>

                            <template v-slot:eyeOpen>
                                <FontAwesomeIcon :icon="faEye"
                                    class="cursor-pointer hover:text-[#22c55e] h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                            </template>
                        </Input>

                        <Input text="Confirmar Senha" :password="true" v-model="confirmPassword">
                            <template v-slot:leftImage>
                                <FontAwesomeIcon :icon="faLock"
                                    class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                            </template>

                            <template v-slot:eyeClosed>
                                <FontAwesomeIcon :icon="faEyeSlash"
                                    class="cursor-pointer hover:text-[#22c55e] h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                            </template>

                            <template v-slot:eyeOpen>
                                <FontAwesomeIcon :icon="faEye"
                                    class="cursor-pointer hover:text-[#22c55e] h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                            </template>
                        </Input>

                        <div class="flex gap-4 pt-2">
                            <button type="submit" :disabled="loading" class="cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                                <FontAwesomeIcon v-if="loading" :icon="faSpinner" spin />
                                Cadastrar
                            </button>

                            <button type="button" @click="router.push('/login')"
                                class="cursor-pointer flex-1 bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 font-bold py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5">
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <div class="absolute inset-0 flex flex-col items-center justify-center z-30 text-center pl-0 p-12">
                    <div
                        class="w-full h-full relative rounded-xl backdrop-blur-sm flex flex-col items-center justify-center p-8">
                        <div class="mb-6 p-4">
                            <img :src="Image" alt="">
                        </div>
                    </div>
                </div>
            </div>
        </BgContainer>
    </Container>
</template>

<style scoped>
@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }

    100% {
        transform: translateY(0px);
    }
}
</style>