<template>
    <div class="logo-wrapper">
        <FButton type="primary" @click="genCode">出码</FButton>
    </div>
</template>

<script setup lang="ts">
import { project } from '@webank/letgo-engine';
import { TransformStage } from '@webank/letgo-types';
import { FButton } from '@fesjs/fes-design';

const genCode = () => {
    const schema = project.getSchema(TransformStage.Save);
    console.log(schema);
};
</script>
