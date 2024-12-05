import { mat4, quat, vec3, vec4 } from "gl-matrix";
import { GLTFNode } from "../Utils/GLTF/types";
import { Mesh } from "../Mesh";

export class Bone {
    private localMatrix: mat4;
    private worldMatrix: mat4;
    private initMatrix: mat4;
    private mesh: Mesh | null = null;
    private skin: number | null = null;
    private children: Bone[];
    private parent: Bone | null = null;

    private rotation: quat;
    private scale: vec3;
    private translation: vec3;

    private defaultScale: vec3;
    private defaultRotation: quat;
    private defaultTranslation: vec3;

    constructor(bone: GLTFNode, parent: Bone | null, mesh: Mesh | null) {
        const {
            rotation = [0, 0, 0, 1],
            scale = [1, 1, 1],
            translation = [0, 0, 0],
            matrix = mat4.create(),
        } = bone;
        this.mesh = mesh;
        this.skin = bone.skin ?? null;
        this.children = [];
        this.parent = parent;

        this.rotation = rotation;
        this.scale = scale;
        this.translation = translation;
        this.initMatrix = matrix;

        this.defaultRotation = rotation;
        this.defaultScale = scale;
        this.defaultTranslation = translation;

        this.worldMatrix = mat4.create();
        this.calculateMatrix();
    }

    public default() {
        this.setTRS(
            this.defaultTranslation,
            this.defaultRotation,
            this.defaultScale
        );

        this.children.forEach((child) => child.default());
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

    public setChildren(children: Bone[]) {
        this.children = children;
    }

    public setTranslation(translation: vec3) {
        this.translation = translation;
        this.calculateLocal();
    }

    public setRotation(rotation: vec4) {
        this.rotation = rotation;
        this.calculateLocal();
    }

    public setTRS(
        translation = this.translation,
        rotation = this.rotation,
        scale = this.scale
    ) {
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
    }

    public update() {
        this.calculateMatrix();

        this.children.forEach((child) => child.update());
    }

    private calculateMatrix() {
        this.calculateLocal();
        this.calculateWorldMatrix();
    }

    private calculateLocal() {
        this.localMatrix = mat4.create();
        mat4.identity(this.localMatrix);

        const temp = mat4.create();

        mat4.fromRotationTranslationScale(
            temp,
            this.rotation,
            this.translation,
            this.scale
        );

        mat4.multiply(this.localMatrix, this.initMatrix, temp);
    }

    private calculateWorldMatrix() {
        const parentMatrix = this.parent?.getWorldMatrix() ?? null;

        if (!parentMatrix) {
            mat4.copy(this.worldMatrix, this.localMatrix);
        } else {
            mat4.multiply(this.worldMatrix, parentMatrix, this.localMatrix);
        }

        this.mesh?.setModelMatrix(this.worldMatrix);
    }
}
