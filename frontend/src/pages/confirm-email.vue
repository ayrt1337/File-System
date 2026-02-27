<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { router } from '../router';
import LoadingSpinner from '../components/loading-spinner.vue';
import Container from '../components/container.vue';
import BgContainer from '../components/bg-container.vue';

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
    <Container>
        <BgContainer class="max-w-[700px] p-15 py-13 pt-14">
            <div class="flex flex-col items-center justify-center" v-if="loading">
                <LoadingSpinner />
                <p class="mt-8 text-center text-[18px] text-gray-400">Verificando suas informações...</p>
            </div>

            <div v-else>
                <div class="flex flex-col items-center justify-center" v-if="success">
                    <img class="size-[200px] mb-6" src="../assets/success.png" alt="success">
                    <p class="text-center text-[20px]">Conta cadastrada com sucesso! Você será redirecionado para o login em breve.</p>
                </div>

                <div class="flex flex-col items-center justify-center" v-else>
                    <img class="size-[200px] mb-6" src="../assets/fail.png" alt="error">
                    <p class="text-center text-[20px]">Algo inesperado aconteceu, tente realizar o cadastro novamente.</p>
                </div>
            </div>
        </BgContainer>
    </Container>
</template>