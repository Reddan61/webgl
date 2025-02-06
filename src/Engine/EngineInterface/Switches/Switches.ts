import {
    ENGINE_CONFIG_KEYS,
    changeEngineConfig,
    getEngineConfig,
} from "../../ENGINE_CONFIG/ENGINE_CONFIG";
import { Switch } from "../Switch/Switch";

import styles from "./Switche.module.scss";

export class Switches {
    private container: HTMLDivElement;
    private aabbSwitch: Switch;
    private shadowMapSwitch: Switch;
    private showRayCastHit: Switch;

    constructor() {
        this.container = document.createElement("div");
        this.container.classList.add(styles.container);

        this.aabbSwitch = new Switch(
            "Show rays",
            getEngineConfig(ENGINE_CONFIG_KEYS.SHOW_AABB)
        );
        this.aabbSwitch.onChange((value) => {
            changeEngineConfig({
                [ENGINE_CONFIG_KEYS.SHOW_AABB]: value,
            });
        });

        this.shadowMapSwitch = new Switch(
            "Show point shadow map",
            getEngineConfig(ENGINE_CONFIG_KEYS.SHOW_POINT_LIGHT_SHADOW_MAP)
        );
        this.shadowMapSwitch.onChange((value) => {
            changeEngineConfig({
                [ENGINE_CONFIG_KEYS.SHOW_POINT_LIGHT_SHADOW_MAP]: value,
            });
        });

        this.showRayCastHit = new Switch(
            "Show ray cast hit",
            getEngineConfig(ENGINE_CONFIG_KEYS.SHOW_RAY_CAST_HIT_POINT)
        );
        this.showRayCastHit.onChange((value) => {
            changeEngineConfig({
                [ENGINE_CONFIG_KEYS.SHOW_RAY_CAST_HIT_POINT]: value,
            });
        });

        this.container.append(this.aabbSwitch.getElement());
        this.container.append(this.shadowMapSwitch.getElement());
        this.container.append(this.showRayCastHit.getElement());
    }

    public getElement() {
        return this.container;
    }
}
