import { glMatrix, mat4, vec2, vec3 } from "gl-matrix";
import { Light } from "..";

type Listener = () => unknown;

const directions = [
    { target: [1, 0, 0], up: [0, -1, 0] }, // +X
    { target: [-1, 0, 0], up: [0, -1, 0] }, // -X
    { target: [0, 1, 0], up: [0, 0, 1] }, // +Y
    { target: [0, -1, 0], up: [0, 0, -1] }, // -Y
    { target: [0, 0, 1], up: [0, -1, 0] }, // +Z
    { target: [0, 0, -1], up: [0, -1, 0] }, // -Z
];

export class PointLight extends Light {
    private position: vec3;
    private onUpdate: Listener | null = null;
    private lightMatrices: mat4[];
    private projMatrix: mat4;
    private farPlane = 100;
    private nearPlane = 0.1;

    private atlasScale = vec2.create();
    private atlasOffset = vec2.create();

    constructor(position: vec3, color: vec3, bright: number) {
        super(color, bright);
        this.position = position;

        this.calculateLightMatrix();
    }

    public getPosition() {
        return this.position;
    }

    public setPosition(position: vec3) {
        this.position = position;
        this.update();
    }

    public _setAtlas(scale: vec2, offset: vec2) {
        this.atlasScale = scale;
        this.atlasOffset = offset;
        this.onUpdate?.();
    }

    public _getAtlas() {
        return {
            offset: this.atlasOffset,
            scale: this.atlasScale,
        };
    }

    public setOnUpdate(listener: Listener) {
        this.onUpdate = listener;
    }

    public getLightMatrices() {
        return this.lightMatrices;
    }

    public getProjMatrix() {
        return this.projMatrix;
    }

    public getFarPlane() {
        return this.farPlane;
    }

    private update() {
        this.calculateLightMatrix();
        this.onUpdate?.();
    }

    private calculateLightMatrix() {
        this.lightMatrices = [];

        this.projMatrix = mat4.create();
        mat4.perspective(
            this.projMatrix,
            glMatrix.toRadian(90),
            1.0,
            this.nearPlane,
            this.farPlane
        );

        const position = this.getPosition();

        directions.forEach(({ target, up }) => {
            const viewMatrix = mat4.create();

            mat4.lookAt(
                viewMatrix,
                position,
                vec3.add(vec3.create(), position, target as vec3),
                up as vec3
            );

            this.lightMatrices.push(
                mat4.multiply(mat4.create(), this.projMatrix, viewMatrix)
            );
        });
    }
}
