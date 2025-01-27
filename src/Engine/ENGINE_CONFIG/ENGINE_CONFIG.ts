export enum ENGINE_CONFIG_KEYS {
    SHOW_AABB = "SHOW_AABB",
    SHOW_POINT_LIGHT_SHADOW_MAP = "SHOW_POINT_LIGHT_SHADOW_MAP",
}

let ENGINE_CONFIG = {
    [ENGINE_CONFIG_KEYS.SHOW_AABB]: false,
    [ENGINE_CONFIG_KEYS.SHOW_POINT_LIGHT_SHADOW_MAP]: false,
};

export const changeEngineConfig = (options: Partial<typeof ENGINE_CONFIG>) => {
    ENGINE_CONFIG = {
        ...ENGINE_CONFIG,
        ...options,
    };
};

export const getEngineConfig = (key: keyof typeof ENGINE_CONFIG) => {
    return ENGINE_CONFIG[key];
};
