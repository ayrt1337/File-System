<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { ref } from "vue";

interface Props {
  text?: string;
  password?: boolean;
  error?: string;
}

const props = defineProps<Props>();
const model = defineModel<string>();
const showText = ref<boolean>(false);
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <div class="relative group">
      <div
        class="absolute inset-y-0 left-0 pl-[18px] flex items-center pointer-events-none"
      >
        <slot name="leftImage"></slot>
      </div>
      <input
        v-model.trim="model"
        :type="password ? (showText ? 'text' : 'password') : 'text'"
        :placeholder="text"
        :class="[
          'w-full py-3.5 px-11 bg-[#1a1a1a] border rounded-full focus:outline-none focus:ring-1 transition-all duration-300 placeholder-gray-600 text-white',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-800 focus:border-[#22c55e] focus:ring-[#22c55e]'
        ]"
      />
      <button
        v-if="password"
        type="button"
        @click="showText = !showText"
        :class="[
          'absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 transition-colors duration-300 focus:outline-none',
          error ? 'hover:text-red-500' : 'hover:text-[#22c55e]'
        ]"
      >
        <FontAwesomeIcon
          v-if="showText"
          :icon="faEyeSlash"
          :class="[
            'cursor-pointer h-5 w-5 text-gray-500 transition-colors duration-300',
            error
              ? 'hover:text-red-500 group-focus-within:text-red-500'
              : 'hover:text-[#22c55e] group-focus-within:text-[#22c55e]'
          ]"
        />

        <FontAwesomeIcon
          v-else
          :icon="faEye"
          :class="[
            'cursor-pointer h-5 w-5 text-gray-500 transition-colors duration-300',
            error
              ? 'hover:text-red-500 group-focus-within:text-red-500'
              : 'hover:text-[#22c55e] group-focus-within:text-[#22c55e]'
          ]"
        />
      </button>
    </div>
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <span v-if="error" class="text-red-500 text-xs px-4 mt-0.5 block text-left">
        {{ error }}
      </span>
    </Transition>
  </div>
</template>
