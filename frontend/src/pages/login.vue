<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Container from '../components/container.vue';
import MessageError from '../components/message-error.vue';
import Input from '../components/input.vue';
import BgContainer from '../components/bg-container.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';

const email = ref<string>('');
const password = ref<string>('');
const rememberMe = ref<boolean>(false);
const loading = ref<boolean>(false);
const router = useRouter();

const handleLogin = async () => {
    const errors = document.getElementsByClassName("error");

    for (const error of errors) {
        error.classList.add("hidden");
    }

    if (email.value == "" || password.value == "") {
        errors[0]?.classList.remove("hidden");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        errors[1]?.classList.remove("hidden");
        return;
    }

    loading.value = true;
    try {
        const result = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ email: email.value, password: password.value, rememberMe: rememberMe.value })
        });

        const output = await result.json();

        if (output == "success") {
            router.push("/my-files");
        }
        else {
            errors[3]?.classList.remove("hidden");
        }
    } catch (error) {
        errors[2]?.classList.remove("hidden");
        console.log("Erro no envio de dados login: ", error)
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Container>
        <BgContainer class="max-w-6xl h-[70vh] flex">
            <div class="w-full lg:w-1/2 pr-0 p-8 md:py-12 lg:py-16 flex flex-col justify-center relative z-20 bg-[#121212]">
                <div class="max-w-md mx-auto w-full">
                    <div class="mb-10">
                        <h1 class="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2 text-center">Bem Vindo!</h1>
                        <p class="text-gray-500 text-center">Faça o login para a sua conta</p>
                    </div>

                    <MessageError>Prencha os campos!</MessageError>
                    <MessageError>Email inválido!</MessageError>
                    <MessageError>Algo de errado aconteceu!</MessageError>
                    <MessageError>Dados Incorretos!</MessageError>

                    <form @submit.prevent="handleLogin" class="mt-5 space-y-6">
                        <Input
                            text="Email"
                            v-model="email"
                        >
                            <template v-slot:leftImage>
                                <FontAwesomeIcon :icon="faEnvelope" class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                            </template>
                        </Input>

                        <Input
                            text="Senha"
                            :password="true"
                            v-model="password"
                        >
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

                        <div class="flex justify-between items-center text-sm">
                            <label class="flex items-center cursor-pointer group">
                                <input v-model="rememberMe" type="checkbox" class="sr-only peer">
                                <div class="relative w-11 h-6 bg-[#1a1a1a] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#22c55e]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-500 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e] peer-checked:after:bg-white peer-checked:after:border-transparent">
                                </div>
                                <span class="ml-3 text-gray-500 group-hover:text-gray-400 transition select-none">Manter login</span>
                            </label>
                            <a @click="router.push('/reset')" class="cursor-pointer text-[#00b300] hover:text-[#22c55e] transition-colors font-medium">Esqueceu a senha?</a>
                        </div>

                        <div class="flex gap-4 pt-2">
                            <button type="submit" class="cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">
                                <FontAwesomeIcon v-if="loading" :icon="faSpinner" spin />
                                Login
                            </button>

                            <button type="button" @click="router.push('/register')" class="cursor-pointer flex-1 bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 font-bold py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5">Cadastrar
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
                            <img src="../assets/unnamed.jpg" alt="">
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