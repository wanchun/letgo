import type { Component } from 'vue';
import type { PropConfig } from '@webank/letgo-types';

export type Setter = {
    renderType: string;
    title?: string;
    Component: Component;
    tester: (scheme: PropConfig) => boolean;
};
