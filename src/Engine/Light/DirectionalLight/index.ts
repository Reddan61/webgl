import { vec3 } from "gl-matrix";
import { Light } from "..";

export class DirectionalLight extends Light {
    private direction: vec3;

    constructor(direction: vec3, color: vec3, bright: number) {
        super(color, bright);

        this.direction = vec3.create();
        vec3.normalize(this.direction, direction);
    }

    public getDirection() {
        return this.direction;
    }
}
