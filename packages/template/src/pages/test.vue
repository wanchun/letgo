<script lang="ts" setup>
import { FButton } from '@fesjs/fes-design';
import { useRouter } from '@fesjs/fes';

const router = useRouter();

function handleClick() {
    router.push('/');
}
</script>

<template>
    <FButton @click="handleClick">
        进入编辑器
    </FButton>
</template>
