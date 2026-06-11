<script setup lang="ts">
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faFileVideo,
  faFileAudio,
  faFilePdf,
  faFileWord,
  faFileImage,
  faFile,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  from?: string;
  to: string;
  title: string;
  description?: string;
  type: "video" | "audio" | "document" | "image";
}

const props = defineProps<Props>();

const fromIcon = computed(() => {
  if (props.from) {
    const ext = props.from.toLowerCase();
    if (props.type === "video") return faFileVideo;
    if (props.type === "audio") return faFileAudio;
    if (props.type === "image" || ext === "jpg" || ext === "png")
      return faFileImage;
    if (ext === "docx" || ext === "doc") return faFileWord;
    if (ext === "pdf") return faFilePdf;
  }
  return faFile;
});

const toIcon = computed(() => {
  const ext = props.to.toLowerCase();
  if (props.type === "video" && ext !== "mp3") return faFileVideo;
  if (props.type === "audio" || ext === "mp3") return faFileAudio;
  if (props.type === "image" || ext === "jpg" || ext === "png")
    return faFileImage;
  if (ext === "docx" || ext === "doc") return faFileWord;
  if (ext === "pdf") return faFilePdf;
  return faFile;
});

const colorClasses = computed(() => {
  switch (props.type) {
    case "video":
      return {
        fromColor: "text-blue-500",
        toColor: "text-emerald-500",
        bgHover: "hover:bg-blue-500/5",
        borderHover: "hover:border-blue-500/20",
      };
    case "audio":
      return {
        fromColor: "text-purple-500",
        toColor: "text-indigo-500",
        bgHover: "hover:bg-purple-500/5",
        borderHover: "hover:border-purple-500/20",
      };
    case "image":
      return {
        fromColor: "text-amber-500",
        toColor: "text-orange-500",
        bgHover: "hover:bg-amber-500/5",
        borderHover: "hover:border-amber-500/20",
      };
    case "document":
    default:
      return {
        fromColor:
          props.from?.toLowerCase() === "docx"
            ? "text-blue-600"
            : "text-green-500",
        toColor:
          props.to.toLowerCase() === "pdf" ? "text-red-500" : "text-green-600",
        bgHover: "hover:bg-green-500/5",
        borderHover: "hover:border-green-500/20",
      };
  }
});
</script>

<template>
  <div
    class="flex items-center justify-between p-4 bg-[#141414]/80 border border-[#222] rounded-xl cursor-pointer transition-all duration-300 group hover:bg-[#222] hover:border-[#333]"
  >
    <div class="flex items-center gap-4">
      <div class="relative w-12 h-10 flex items-center justify-center">
        <div
          :class="[
            'absolute top-0 left-0 text-xl opacity-75',
            colorClasses.fromColor,
          ]"
        >
          <FontAwesomeIcon v-if="from" :icon="fromIcon" />
        </div>

        <div
          v-if="from"
          class="absolute inset-0 flex items-center justify-center text-[10px] text-gray-600 z-10 rotate-[25deg]"
        >
          <FontAwesomeIcon :icon="faArrowRight" />
        </div>

        <div
          :class="[
            from ? 'absolute bottom-0 right-0 text-xl' : 'text-2xl',
            colorClasses.toColor,
          ]"
        >
          <FontAwesomeIcon :icon="toIcon" />
        </div>
      </div>

      <div class="flex flex-col">
        <div
          class="flex items-center gap-1 text-white font-semibold text-sm group-hover:text-white transition-colors duration-200 tracking-wide"
        >
          <span :class="[from ? 'uppercase' : 'capitalize']">
            {{ from ? from : "Converter" }}
          </span>
          <span class="text-gray-500 lowercase font-normal px-0.5">para</span>
          <span class="uppercase">{{ to }}</span>
        </div>
        <span
          class="text-gray-500 text-[11px] font-normal group-hover:text-gray-400 transition-colors duration-200"
        >
          {{ title }}
        </span>
      </div>
    </div>
  </div>
</template>
