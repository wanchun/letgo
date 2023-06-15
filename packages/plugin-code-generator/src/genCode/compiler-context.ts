const context: {
    config: Record<string, any>
} = {

    config: {},
};

export function getCurrentContext() {
    return context;
}

export function setGlobalConfig(config: Record<string, any>) {
    context.config = config;
}
