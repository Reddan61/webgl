import { vec3 } from "gl-matrix";

export class DirectionalLight {
    private direction: vec3;
    private intensity: vec3;

    constructor(direction: vec3, intensity: vec3) {
        this.direction = vec3.create();
        vec3.normalize(this.direction, direction);
        this.intensity = intensity;
    }

    public getIntensity() {
        return this.intensity;
    }

    public getDirection() {
        return this.direction;
    }
}
