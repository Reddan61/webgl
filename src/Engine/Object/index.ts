import { mat3, mat4, vec3, vec4 } from "gl-matrix";
import { Rotation } from "../Rotation";

interface Geometry {
    vertices: {
        data: number[];
        max: number[];
        min: number[];
    };
    indices: number[];
    textureCoords: number[];
    normals: number[];
}

interface Materials {
    colorFactor: vec4;
    baseTexture: HTMLImageElement | null;
}

export type ObjectContent = {
    geometry: Geometry;
    materials: Materials;
}[];

export class Object {
    private position: vec3;
    private content: ObjectContent;
    private singleFace = false;
    private flipYTexture = true;
    private scaling: vec3;

    private translation: mat4 = mat4.create();
    private scalingMatrix: mat4 = mat4.create();
    private transformMatrix: mat4 = mat4.create();
    private normalMatrix: mat3 = mat3.create();
    private modelMatrix: mat4 = mat4.create();

    private rotation: Rotation;

    constructor(content: ObjectContent, position: vec3, scaling: vec3) {
        this.position = position;
        this.content = content;
        this.rotation = new Rotation();
        this.scaling = scaling;

        this.calculateMatrix();
    }

    public getModelMatrix() {
        return this.modelMatrix;
    }

    public getNormalMatrix() {
        return this.normalMatrix;
    }

    public getContent() {
        return this.content;
    }

    public isSingleFace() {
        return this.singleFace;
    }

    public isFlipYTexture() {
        return this.flipYTexture;
    }

    public setFlipYTexture(bool: boolean) {
        this.flipYTexture = bool;
    }

    public setSingleFace(bool: boolean) {
        this.singleFace = bool;
    }

    public rotate(xAngle: number, yAngle: number) {
        this.rotation.rotate(xAngle, yAngle);
        this.calculateMatrix();
    }

    public setPosition(position: vec3) {
        this.position = position;
        this.calculateMatrix();
    }

    public setPositionX(num: number) {
        this.position[0] = num;
        this.calculateMatrix();
    }

    public setPositionY(num: number) {
        this.position[1] = num;
        this.calculateMatrix();
    }

    public setPositionZ(num: number) {
        this.position[2] = num;
        this.calculateMatrix();
    }

    public addPosition(deltaPos: vec3) {
        vec3.add(this.position, this.position, deltaPos);
        this.calculateMatrix();
    }

    public getPosition() {
        return this.position;
    }

    public setScaling(scaling: vec3) {
        this.scaling = scaling;
        this.calculateMatrix();
    }

    public update() {}

    private calculateMatrix() {
        mat4.fromScaling(this.scalingMatrix, this.scaling);
        mat4.fromTranslation(this.translation, this.position);

        mat4.mul(this.transformMatrix, this.translation, this.scalingMatrix);
        mat4.mul(
            this.modelMatrix,
            this.transformMatrix,
            this.rotation.getRotation()
        );
        mat3.normalFromMat4(this.normalMatrix, this.modelMatrix);
    }
}
