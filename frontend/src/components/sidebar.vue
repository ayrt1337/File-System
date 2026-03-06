<script setup lang="ts">

</script>

<template>
    <div class="pt-8 px-7 text-[#cccccc] fixed top-0 left-0 bg-[#121212] min-h-[100vh] max-w-[320px] w-full">
        <div>
            <p class="text-[20px]">MyFileSystem</p>
        </div>

        <div class="cursor-pointer w-auto py-4 px-7 mt-5 inline-block bg-[#363333ac] rounded-[10px]">
            <div class="flex items-center">
                <p class="text-[30px] mr-3">+</p>
                <p class="text-[25px]">Novo</p>
            </div>
        </div>

        <div class="flex flex-col mt-10">
            <div class="py-2 px-5 hover:bg-[#009900] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex flex-col">
                <p>Meus Arquivos</p>
            </div>

            <div class="py-2 px-5 hover:bg-[#009900] hover:text-white rounded-full transition-all duration-300 text-[17px] cursor-pointer flex flex-col">
                <p>Arquivos Compartilhados</p>
            </div>
        </div>
    </div>
</template>