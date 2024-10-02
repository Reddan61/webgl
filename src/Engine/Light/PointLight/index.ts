import { vec3 } from "gl-matrix";
import { Light } from "..";

export class PointLight extends Light {
    private position: vec3;

    constructor(position: vec3, color: vec3, bright: number) {
        super(color, bright);
        this.position = position;
    }

    public getPosition() {
        return this.position;
    }

    public setPosition(position: vec3) {
        this.position = position;
    }
}
