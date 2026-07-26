<script setup lang="ts">
import LoadingSpinner from "../components/loading-spinner.vue";
import ServerError from "./server-error.vue";
import Unauthorized from "./unauthorized.vue";
import Toast from "./toast.vue";
import { useLoading } from "../composables/use-loading";
import { useServerError } from "../composables/use-server-error";
import { useUnauthorized } from "../composables/use-unauthorized";
import UploadProgressManager from "./upload-progress-manager.vue";

const { showLoading } = useLoading();
const { showError } = useServerError();
const { showUnauthorized } = useUnauthorized();
</script>

<template>
  <UploadProgressManager />
  <Toast />
  <LoadingSpinner v-if="showLoading" />

  <template v-else>
    <ServerError v-if="showError" />
    <Unauthorized v-else-if="showUnauthorized" />
    <slot v-else />
  </template>
</template>
