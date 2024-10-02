import { vec3 } from "gl-matrix";

export class Light {
    private color: vec3;
    private bright: number;

    constructor(color: vec3, bright: number) {
        this.color = color;
        this.bright = bright;
    }

    public getColor() {
        return this.color;
    }

    public getBright() {
        return this.bright;
    }
}
