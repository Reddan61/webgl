import { vec3 } from "gl-matrix";

export class AmbientLight {
    private intensity: vec3;

    constructor(intensity: vec3) {
        this.intensity = intensity;
    }

    public getIntensity() {
        return this.intensity;
    }
}
