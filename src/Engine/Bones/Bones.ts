import { mat4, quat, vec3, vec4 } from "gl-matrix";
import { GLTFNode } from "../Utils/GLTF/types";

export class Bone {
    private localMatrix: mat4;
    private worldMatrix: mat4;
    private mesh: number | null = null;
    private skin: number | null = null;
    private children: number[];
    private parent: Bone | null = null;
    private rotation: quat;
    private scale: vec3;
    private translation: vec3;

    constructor(bone: GLTFNode, parent: Bone | null) {
        const {
            rotation = [0, 0, 0, 1],
            scale = [1, 1, 1],
            translation = [0, 0, 0],
        } = bone;

        this.mesh = bone.mesh ?? null;
        this.skin = bone.skin ?? null;
        this.children = bone.children ?? [];
        this.parent = parent;

        this.rotation = rotation;
        this.scale = scale;
        this.translation = translation;

        this.calculateLocal();
        this.worldMatrix = mat4.create();
        mat4.copy(this.worldMatrix, this.localMatrix);
    }

    public getWorldMatrix() {
        return this.worldMatrix;
    }

    public getLocalMatrix() {
        return this.localMatrix;
    }

    public getSkin() {
        return this.skin;
    }

    public getMesh() {
        return this.mesh;
    }

    public getChildren() {
        return this.children;
    }

    public setTranslation(translation: vec3) {
        this.translation = translation;
        this.calculateLocal();
    }

    public setRotation(rotation: vec4) {
        this.rotation = rotation;
        this.calculateLocal();
    }

    public setTranslationNRotation(
        translation = this.translation,
        rotation = this.rotation
    ) {
        this.translation = translation;
        this.rotation = rotation;
        this.calculateLocal();
    }

    public update(bones: Bone[]) {
        this.calculateWorldMatrix(this.parent?.getWorldMatrix() ?? null);

        for (let i = 0; i < this.children.length; i++) {
            bones[this.children[i]].update(bones);
        }
    }

    private calculateLocal() {
        this.localMatrix = mat4.create();
        mat4.identity(this.localMatrix);

        mat4.fromRotationTranslationScale(
            this.localMatrix,
            this.rotation,
            this.translation,
            this.scale
        );
    }

    private calculateWorldMatrix(parentMatrix: mat4 | null) {
        if (!parentMatrix) {
            mat4.copy(this.worldMatrix, this.localMatrix);
            return;
        }
        mat4.multiply(this.worldMatrix, parentMatrix, this.localMatrix);
    }
}
