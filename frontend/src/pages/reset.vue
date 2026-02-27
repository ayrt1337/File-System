<script setup lang="ts">
import { ref } from 'vue';
import { router } from '../router';
import Container from '../components/container.vue';
import MessageError from '../components/message-error.vue';
import BgContainer from '../components/bg-container.vue';
import Input from '../components/input.vue';

const email = ref<string>("");

const sendEmail = async (): Promise<void> => {
    const errors = document.getElementsByClassName("error");

    for (const error of errors) {
        error.classList.add("hidden");
    }

    if (email.value == "") {
        errors[0]?.classList.remove("hidden");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        errors[1]?.classList.remove("hidden");
        return;
    }

    try {
        const result = await fetch("http://localhost:3000/reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email: email.value })
        });

        const output = await result.json();

        if (output == "success") {
            router.push({
                name: "email",
                state: { email: email.value, reason: "reset" }
            });
        }
    } catch (error) {
        errors[2]?.classList.remove("hidden");
        console.log("Erro no envio de email: ", error);
    }
}
</script>

<template>
    <Container>
        <BgContainer class="flex flex-col items-center justify-center max-w-[700px] p-15 py-13 pt-14">
            <h1 class="mb-6 text-[18px]">Digite o email da conta que deseja trocar a senha</h1>

            <MessageError>Prencha o campo!</MessageError>
            <MessageError>Email inválido!</MessageError>
            <MessageError>Algo de errado aconteceu!</MessageError>

            <Input class="w-full"
                text="Email"
                v-model="email"
            >
                <template class="w-full mt-5" v-slot:leftImage>
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                </template>
            </Input>

            <button type="button" @click="sendEmail()"
                class="mt-6 cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">
                Solicitar Alteração
            </button>
        </BgContainer>
    </Container>
</template>