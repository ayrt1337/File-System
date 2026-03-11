<script setup lang="ts">
import Container from '../components/container.vue';
</script>

<template>
    <Container>
            <div class="flex flex-col items-center space-y-8 text-center px-10">
                <h1 class="text-center text-9xl font-black bg-gradient-to-b from-[#22c55e] to-[#006600] bg-clip-text text-transparent">
                    403
                </h1>
                
                <div class="space-y-2">
                    <h2 class="text-3xl font-bold text-white mb-3">Acesso Negado</h2>

                    <div>
                        <p class="text-gray-400 text-lg">
                            Você não tem as permissões necessárias para acessar esta área. 
                        </p>
                        <p class="text-gray-400 text-lg">
                            Certifique-se de estar logado com a conta correta.
                        </p>
                    </div>
                </div>
            </div>
    </Container>
</template>

<style scoped>
h1 {
    filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.2));
}
</style>