import type { Ref } from 'vue';
import { ref } from 'vue';

// 解析执行
export class TemporaryState {
    id: string;
    value: Ref<any>;
    constructor(id: string, initValue: string) {
        this.id = id;
        this.value = ref(initValue);
    }

    getState() {
        return {
            id: this.id,
            value: this.value,
        };
    }

    setValue(value: any) {
        this.value.value = value;
    }
}
