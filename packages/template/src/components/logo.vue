<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from '@fesjs/fes';

export default defineComponent({
    setup() {
        const router = useRouter();

        const go = () => {
            router.push('/test');
        };

        return {
            go,
        };
    },
});
</script>

<template>
    <div class="logo-wrapper" @click="go">
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
