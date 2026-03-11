<script setup lang="ts">
import Container from '../components/container.vue';
</script>

<template>
    <Container>
            <div class="flex flex-col items-center space-y-8 text-center px-10">
                <h1 class="text-center text-9xl font-black bg-gradient-to-b from-[#22c55e] to-[#006600] bg-clip-text text-transparent">
                    404
                </h1>
                
                <div class="flex flex-col items-center space-y-2">
                    <h2 class="text-3xl font-bold text-white mb-3">Página Não Encontrada</h2>

                    <div>
                        <p class="text-gray-400 text-lg">
                            Ops! Parece que você se perdeu.
                        </p>
                        <p class="text-gray-400 text-lg">
                            A página que você está procurando não existe ou foi movida.
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
