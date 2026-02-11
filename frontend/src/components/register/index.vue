<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const showPassword = ref<boolean>(false);
const confirmShowPassword = ref<boolean>(false);
const router = useRouter();

const handleRegister = async () => {
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

    if (password.value != confirmPassword.value) {
        errors[2]?.classList.remove("hidden");
        return;
    }

    try {
        const result = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email: email.value, password: password.value })
        });

        const output = await result.json();

        if (output == "success") router.push({
            name: "email",
            state: { email: email.value, password: password.value, reason: "confirmation" }
        })
        else{
            errors[3]?.classList.remove("hidden");
        }
    } catch (error) {
        console.log("Erro no envio de email: ", error);
        errors[3]?.classList.remove("hidden");
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-black font-sans text-gray-300">
        <div class="w-full max-w-6xl h-[70vh] flex shadow-2xl overflow-hidden rounded-2xl bg-[#121212] relative z-10">
            <div
                class="w-full lg:w-1/2 pr-0 p-8 md:py-12 lg:py-16 flex flex-col justify-center relative z-20 bg-[#121212]">
                <div class="max-w-md mx-auto w-full">
                    <div class="mb-5">
                        <h1
                            class="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2 text-center">
                            Create Account</h1>
                        <p class="text-gray-500 text-center">Join us today!</p>
                    </div>

                    <p class="error text-red-500 text-center hidden">Prencha os campos!</p>
                    <p class="error text-red-500 text-center hidden">Email inválido!</p>
                    <p class="error text-red-500 text-center hidden">As senhas devem ser iguais!</p>
                    <p class="error text-red-500 text-center hidden">Algo de errado aconteceu!</p>

                    <form @submit.prevent="handleRegister" class="pt-5 space-y-6">
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <input v-model="email" type="text" placeholder="Email Address"
                                class="w-full py-3.5 pl-12 pr-4 bg-[#1a1a1a] border border-gray-800 rounded-full focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all duration-300 placeholder-gray-600 text-white" />
                        </div>

                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                            <input v-model.trim="password" :type="showPassword ? 'text' : 'password'"
                                placeholder="Password"
                                class="w-full py-3.5 pl-12 pr-12 bg-[#1a1a1a] border border-gray-800 rounded-full focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all duration-300 placeholder-gray-600 text-white" />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#22c55e] transition-colors duration-300 focus:outline-none">
                                <svg v-if="showPassword" class="h-5 w-5" viewBox="0 0 21 21"
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
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>

                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                            <input v-model.trim="confirmPassword" :type="confirmShowPassword ? 'text' : 'password'"
                                placeholder="Confirm Password"
                                class="w-full py-3.5 pl-12 pr-12 bg-[#1a1a1a] border border-gray-800 rounded-full focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all duration-300 placeholder-gray-600 text-white" />
                            <button type="button" @click="confirmShowPassword = !confirmShowPassword"
                                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#22c55e] transition-colors duration-300 focus:outline-none">
                                <svg v-if="confirmShowPassword" class="h-5 w-5" viewBox="0 0 21 21"
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
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>

                        <div class="flex gap-4 pt-2">
                            <button type="submit"
                                class="cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">
                                SIGN UP
                            </button>

                            <button type="button" @click="router.push('/login')"
                                class="cursor-pointer flex-1 bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 font-bold py-3.5 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-0.5">
                                SIGN IN
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
                            <img src="../../assets/unnamed.jpg" alt="">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
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