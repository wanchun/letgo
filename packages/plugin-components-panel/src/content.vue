<template>
    <AppstoreOutlined class="icon"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { AppstoreOutlined } from '@fesjs/fes-design/icon';

export default defineComponent({
    components: {
        AppstoreOutlined
    },
    setup (){
        return {}
    }
})

</script>
<style scoped>
.icon {
    cursor: pointer;
}
</style>