import { mat3, mat4, vec3 } from "gl-matrix";
import { Rotation } from "../Rotation";
import { Mesh } from "../Mesh";
import { BoneAnimation } from "../Animation/BoneAnimation";
import { Bone } from "../Bones/Bones";
import { AABB } from "../AABB";

export class Object {
    private position: vec3;
    private meshes: Mesh[];
    private singleFace = false;
    private flipYTexture = true;
    private scaling: vec3;
    private aabb: AABB;

    private translation: mat4 = mat4.create();
    private scalingMatrix: mat4 = mat4.create();
    private transformMatrix: mat4 = mat4.create();
    private normalMatrix: mat3 = mat3.create();
    private modelMatrix: mat4 = mat4.create();

    private rotation: Rotation;

    private animations: BoneAnimation[] = [];
    private bones: Bone[] = [];

    constructor(
        meshes: Mesh[],
        position: vec3,
        scaling: vec3,
        bones: Bone[] = [],
        animations: BoneAnimation[] = []
    ) {
        this.position = position;
        this.meshes = meshes;
        this.rotation = new Rotation();
        this.scaling = scaling;
        this.animations = animations;
        this.bones = bones;

        this.calculateMatrix();
        this.createAABB();
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.meshes.forEach((mesh) => {
            mesh._setWebGl(webgl);
        });
    }

    public getModelMatrix() {
        return this.modelMatrix;
    }

    public getNormalMatrix() {
        return this.normalMatrix;
    }

    public getMeshes() {
        return this.meshes;
    }

    public isSingleFace() {
        return this.singleFace;
    }

    public isFlipYTexture() {
        return this.flipYTexture;
    }

    public getAABB() {
        return this.aabb;
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
        this.meshes.forEach((mesh) =>
            mesh.getLight()?.setPosition(this.position)
        );
        this.calculateMatrix();
    }

    public setPositionX(num: number) {
        this.setPosition(
            vec3.fromValues(num, this.position[1], this.position[2])
        );
    }

    public setPositionY(num: number) {
        this.setPosition(
            vec3.fromValues(this.position[0], num, this.position[2])
        );
    }

    public setPositionZ(num: number) {
        this.setPosition(
            vec3.fromValues(this.position[0], this.position[1], num)
        );
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

    public update() {
        this.animations.forEach((animation) => animation.update(this.bones));
        this.meshes.forEach((mesh) => mesh.update());
        this.createAABB();
    }

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

    private createAABB() {
        let max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
        let min = vec3.fromValues(Infinity, Infinity, Infinity);

        this.meshes.forEach((mesh) => {
            const aabb = mesh.getAABB();
            const maxMin = aabb.getMaxMin();

            vec3.max(max, max, maxMin.max);
            vec3.min(min, min, maxMin.min);
        });

        this.aabb = new AABB(max, min);
    }
}
