import { mat4, vec3 } from "gl-matrix";
import { Light } from "..";

export class DirectionalLight extends Light {
    private direction: vec3;
    private lightMatrix: mat4;

    constructor(direction: vec3, color: vec3, bright: number) {
        super(color, bright);

        this.direction = vec3.create();
        vec3.normalize(this.direction, direction);
        this.calculateLightMatrix();
    }

    public getDirection() {
        return this.direction;
    }

    public getLightMatrix() {
        return this.lightMatrix;
    }

    private calculateLightMatrix() {
        const dir = this.getDirection();
        const lightPosition = vec3.fromValues(
            dir[0] * 100,
            dir[1] * 100,
            dir[2] * 100
        );
        const targetPosition = vec3.fromValues(0, 0, 0);
        const upDirection = vec3.fromValues(0, 1, 0);

        const viewMatrixLight = mat4.create();
        mat4.lookAt(
            viewMatrixLight,
            lightPosition,
            targetPosition,
            upDirection
        );

        const left = -100,
            right = 100,
            bottom = -100,
            top = 100,
            near = 0.1,
            far = 1000;
        const projectionMatrixLight = mat4.create();
        mat4.ortho(projectionMatrixLight, left, right, bottom, top, near, far);

        this.lightMatrix = mat4.create();
        mat4.multiply(this.lightMatrix, projectionMatrixLight, viewMatrixLight);
    }
}
