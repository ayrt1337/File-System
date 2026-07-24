<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number;
  }>(),
  {
    count: 4,
  }
);
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <div
      v-for="n in count"
      :key="n"
      class="bg-[#1e1e1e]/40 border border-white/5 rounded-2xl p-5 h-44 animate-pulse flex flex-col justify-between"
    >
      <div class="flex items-center justify-between">
        <div class="w-10 h-10 bg-white/5 rounded-lg"></div>
        <div class="w-12 h-6 bg-white/5 rounded-md"></div>
      </div>
      <div class="h-5 bg-white/5 rounded w-3/4 my-4"></div>
      <div class="flex items-center justify-between">
        <div class="h-4 bg-white/5 rounded w-1/4"></div>
        <div class="h-4 bg-white/5 rounded w-1/3"></div>
      </div>
    </div>
  </div>
</template>
