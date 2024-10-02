import { vec3 } from "gl-matrix";
import { Light } from "..";

type Listener = () => unknown;
export class PointLight extends Light {
    private position: vec3;
    private onUpdate: Listener | null = null;

    constructor(position: vec3, color: vec3, bright: number) {
        super(color, bright);
        this.position = position;
    }

    public getPosition() {
        return this.position;
    }

    public setPosition(position: vec3) {
        this.position = position;
        this.onUpdate?.();
    }

    public setOnUpdate(listener: Listener) {
        this.onUpdate = listener;
    }
}
