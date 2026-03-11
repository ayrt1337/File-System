<script setup lang="ts">
import { ref } from 'vue';
import { router } from '../router';
import Container from '../components/container.vue';
import MessageError from '../components/message-error.vue';
import BgContainer from '../components/bg-container.vue';
import Input from '../components/input.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'; 

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
        const result = await fetch(import.meta.env.VITE_API_BASE_URL + `/reset`, {
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

            <Input class="w-full" text="Email" v-model="email">
                <template v-slot:leftImage>
                    <FontAwesomeIcon :icon="faEnvelope"
                        class="h-5 w-5 text-gray-500 group-focus-within:text-[#22c55e] transition-colors duration-300" />
                </template>
            </Input>

            <button type="button" @click="sendEmail()"
                class="mt-6 cursor-pointer flex-1 bg-[#009900] hover:bg-[#22c55e] text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">
                Solicitar Alteração
            </button>
        </BgContainer>
    </Container>
</template>