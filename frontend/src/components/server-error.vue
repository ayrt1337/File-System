<script setup lang="ts">
import Container from '../components/container.vue';
</script>

<template>
    <Container>
            <div class="flex flex-col items-center space-y-8 text-center px-10">
                <h1 class="text-9xl font-black bg-gradient-to-b from-red-500 to-red-900 bg-clip-text text-transparent">
                    500
                </h1>
                
                <div class="flex flex-col items-center space-y-2">
                    <h2 class="text-3xl font-bold text-white mb-3">Ooops... Algo deu errado.</h2>

                    <div>
                        <p class="text-gray-400 text-lg">
                            Algo deu errado do nosso lado. Estamos trabalhando para consertar.
                        </p>
                        <p class="text-gray-400 text-lg">
                            Por favor, tente recarregar a página novamentes. 
                        </p>
                    </div>
                </div>
            </div>
    </Container>
</template>

<style scoped>
h1 {
    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.2));
}
</style>
