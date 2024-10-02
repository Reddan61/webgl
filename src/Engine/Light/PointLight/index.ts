import { vec3 } from "gl-matrix";

export class PointLight {
    private position: vec3;

    constructor(position: vec3) {
        this.position = position;
    }

    public getPosition() {
        return this.position;
    }
}
