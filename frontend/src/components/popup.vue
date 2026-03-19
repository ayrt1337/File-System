<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTriangleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

interface Props {
    type: string
};

defineProps<Props>();
</script>

<template>
    <div :class="[
        'fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-[15px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl border transition-all duration-300',
        type === 'error' ? 'bg-[#1a1111]/95 border-red-500/20 text-red-400' : 'bg-[#111a11]/95 border-emerald-500/20 text-emerald-400'
    ]">
        <div :class="[
            'flex items-center justify-center w-10 h-10 rounded-full border',
            type === 'error' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
        ]">
            <FontAwesomeIcon :icon="type === 'error' ? faTriangleExclamation : faCircleCheck" />
        </div>
        <div class="flex flex-col text-sm">
            <span class="font-semibold text-white/90">
                {{ type === 'error' ? 'Ops! Algo deu errado' : 'Sucesso!' }}
            </span>
            <span :class="type === 'error' ? 'text-red-400/80' : 'text-emerald-400/80'">
                {{ type === 'error' ? 'Ocorreu um erro inesperado. Tente novamente.' : 'Ação realizada com sucesso.' }}
            </span>
        </div>
    </div>
</template>