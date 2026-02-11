<template>
    <div class="flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-[#1e1e1e] rounded-full"></div>

            <div
                class="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin">
            </div>
        </div>
        <p class="mt-4 text-emerald-500 font-medium tracking-wide">Carregando...</p>
    </div>
</template>

<style scoped>
@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}
</style>
