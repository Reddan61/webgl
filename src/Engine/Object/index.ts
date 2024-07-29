import { mat3, mat4, vec3 } from "gl-matrix";
import { Rotation } from "../Rotation";


interface Geometry {
    vertices: {
        data: number[],
        max: number[],
        min: number[]
    }, 
    indices: number[], 
    textureCoords: number[], 
    normals: number[],
};

interface Materials {
    baseTexture: HTMLImageElement
}

type ObjectContent = {
    geometry: Geometry,
    materials: Materials
}[]

export class Object {
    constructor(
        content: ObjectContent,
        position: vec3,
        scaling: vec3
    ) {
        this.position = position;
        this.content = content;
        this.rotation = new Rotation();

        mat4.fromScaling(this.scaling, scaling);
        mat4.fromTranslation(this.translation, this.position);
        
        mat4.mul(this.transformMatrix, this.translation, this.scaling);
        this.calculateModelMatrix();
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
        this.calculateModelMatrix();
    }
    
    public update() {
    }

    private calculateModelMatrix() {
        mat4.mul(this.modelMatrix, this.transformMatrix, this.rotation.getRotation());
        mat3.normalFromMat4(this.normalMatrix, this.modelMatrix);
    }

    private position: vec3 = null;
    private content: ObjectContent = null;
    private singleFace = false;
    private flipYTexture = true;

    private translation: mat4 = mat4.create();
    private scaling: mat4 = mat4.create();
    private transformMatrix: mat4 = mat4.create();
    private normalMatrix: mat3 = mat3.create();
    private modelMatrix:  mat4 = mat4.create();

    private rotation: Rotation = null;
}