<script setup lang="ts">
import { ref, onMounted } from "vue";
import { router } from "../../router";
import LoadingSpinner from '../loading-spinner/index.vue';

interface Props {
    token: string
}

const props = defineProps<Props>();

const password = ref<string>("");
const confirmPassword = ref<string>("");
const loading = ref<boolean>(true);
const success = ref<boolean>(false);
const showInput = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);

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
        const result = await fetch("http://localhost:3000/resetPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ token: props.token, password: password })
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
    <div class="min-h-screen flex items-center justify-center bg-black font-sans text-gray-300">
        <div
            class="relative w-full max-w-[700px] p-15 py-13 pt-14 flex flex-col items-center justify-center shadow-2xl overflow-hidden rounded-2xl bg-[#121212] z-10">
            <div v-if="loading">
                <LoadingSpinner />
                <p class="mt-8 text-center text-[18px] text-gray-400">Verificando suas informações...</p>
            </div>

            <div class="w-full" v-else>
                <div class="w-full flex flex-col items-center justify-center" v-if="showInput">
                    <h1 class="mb-6 text-[18px]">Escreva abaixo a nova senha</h1>

                    <p class="error text-red-500 text-center hidden">Prencha os campos!</p>
                    <p class="error text-red-500 text-center hidden">As senhas devem ser iguais!</p>
                    <p class="error text-red-500 text-center hidden">Algo de errado aconteceu!</p>

                    <div class="w-full relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <input v-model.trim="password" :type="showPassword ? 'type' : 'password'" placeholder="Senha"
                            class="w-full py-3.5 pl-12 pr-4 bg-[#1a1a1a] border border-gray-800 rounded-full focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all duration-300 placeholder-gray-600 text-white" />

                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#22c55e] transition-colors duration-300 focus:outline-none">
                            <svg v-if="showPassword" class="cursor-pointer h-5 w-5" viewBox="0 0 21 21"
                                xmlns="http://www.w3.org/2000/svg">
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
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="cursor-pointer h-5 w-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>

                    <div class="w-full relative group mt-5">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <input v-model.trim="confirmPassword" :type="showConfirmPassword ? 'type' : 'password'"
                            placeholder="Confirmar Senha"
                            class="w-full py-3.5 pl-12 pr-4 bg-[#1a1a1a] border border-gray-800 rounded-full focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all duration-300 placeholder-gray-600 text-white" />

                        <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#22c55e] transition-colors duration-300 focus:outline-none">
                            <svg v-if="showConfirmPassword" class="cursor-pointer h-5 w-5" viewBox="0 0 21 21"
                                xmlns="http://www.w3.org/2000/svg">
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
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="cursor-pointer h-5 w-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>

                    <button type="button" @click="changePassword()"
                        class="mt-6 cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">Solicitar
                        Alteração
                    </button>
                </div>

                <div v-else>
                    <div class="flex flex-col items-center justify-center" v-if="success">
                        <img class="size-[200px] mb-6" src="../../assets/success.png" alt="success">
                        <p class="text-center text-[20px]">Senha alterada com sucesso! Você será redirecionado para o
                            login
                            em breve.</p>
                    </div>

                    <div class="flex flex-col items-center justify-center" v-else>
                        <img class="size-[200px] mb-6" src="../../assets/fail.png" alt="error">
                        <p class="text-center text-[20px]">Algo inesperado aconteceu, tente realizar a alteração de
                            senha
                            novamente.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>