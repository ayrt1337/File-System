<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Container from '../components/container.vue';
import BgContainer from '../components/bg-container.vue';
import { router } from '../router';

const { email, password, reason } = history.state;

onMounted(() => {
    if (!email || !reason) {
        router.push('/login');
    }
})

const popup = ref<boolean>(false);

const reSendEmail = async () => {
    popup.value = true;
    setTimeout(() => {
        popup.value = false;
    }, 2000);

    const path = reason == "confirmation" ? "register" : "reset";

    try {
        await fetch(`http://localhost:3000/${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email: email, password: password })
        });
    } catch (error) {
        console.log("Erro no reenvio do email: ", error);
    }
}
</script>

<template>
    <Container>
        <BgContainer class="flex-col items-center justify-center flex max-w-[700px] p-15 py-13 pt-14">
            <Transition name="fade-scale">
                <div v-if="popup" class="absolute bg-[#0f0f0f] rounded-2xl p-4 px-6">
                    <p class="text-[18px] text-[#ffffff] font-medium flex items-center gap-2">
                        Email reenviado!
                    </p>
                </div>
            </Transition>

            <img class="size-[240px]" src="../assets/email-img.png" alt="email">

            <p class="text-center mb-5 mt-6 text-[20px]">Enviamos um email para <span class="text-[#009900]">{{ email }}</span>, clique no link presente para {{ reason == "confirmation" ? "confirmar o seu cadastro." : "redefinir sua senha." }}</p>
            <p class="text-center text-[20px]"><span @click="reSendEmail()" class="cursor-pointer text-[#009900]">Clique aqui</span> se você não recebeu nenhum email.</p>
        </BgContainer>
    </Container>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
    opacity: 1;
    transform: scale(1) translateY(0);
}
</style>
