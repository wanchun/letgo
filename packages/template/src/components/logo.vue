<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<template>
  <div class="logo-wrapper">
    <img class="logo-image" src="@/images/logo.png">
    Letgo 低代码平台
  </div>
</template>

<style lang="less">
.logo-wrapper {
    font-size: 16px;
    display: flex;
    align-items: center;
    .logo-image {
        width: 40px;
        margin-right: 8px;
    }
}
</style>
