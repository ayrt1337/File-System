<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { router } from '../../router';
import LoadingSpinner from '../loading-spinner/index.vue';

interface Props {
    token: string
};

const props = defineProps<Props>();

const loading = ref<boolean>(true);
const success = ref<boolean>(false);

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
            success.value = true;
            loading.value = false;
            setTimeout(() => {
                router.push("/login");
            }, 2000)
        }
        else {
            loading.value = false;
        }
    } catch (error) {
        console.error("Erro na verificação do token: ", error);
        loading.value = false;
    }
})
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-black font-sans text-gray-300">
        <div v-if="loading" class="relative w-full max-w-[700px] p-15 py-13 pt-14 flex flex-col items-center justify-center shadow-2xl overflow-hidden rounded-2xl bg-[#121212] z-10">
            <LoadingSpinner />
            <p class="mt-8 text-center text-[18px] text-gray-400">Verificando suas informações...</p>
        </div>

        <div v-else>
            <div v-if="success" class="relative w-full max-w-[700px] p-15 py-13 pt-14 flex flex-col items-center justify-center shadow-2xl overflow-hidden rounded-2xl bg-[#121212] z-10">
                <img class="size-[200px] mb-6" src="../../assets/success.png" alt="success">
                <p class="text-center text-[20px]">Conta cadastrada com sucesso! Você será redirecionado para o login em breve.</p>
            </div>

            <div v-else class="relative w-full max-w-[700px] p-15 py-13 pt-14 flex flex-col items-center justify-center shadow-2xl overflow-hidden rounded-2xl bg-[#121212] z-10">
                <img class="size-[200px] mb-6" src="../../assets/fail.png" alt="error">
                <p class="text-center text-[20px]">Algo inesperado aconteceu, tente realizar o cadastro novamente.</p>
            </div>
        </div>
    </div>
</template>