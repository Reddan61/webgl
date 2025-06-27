import { mat4, quat, vec3, vec4 } from "gl-matrix";
import { unsubArr } from "engine/Utils/Utils";
import { GLTFNode } from "engine/Utils/GLTF/types";
import { Mesh } from "engine/Mesh";

type UpdateSubscriberCb = (bone: Bone) => void;

export class Bone {
    private localMatrix: mat4;
    private worldMatrix: mat4;
    private initMatrix: mat4;
    private skin: number | null = null;
    private selfIndex: number;
    private childrenIndexes: number[];
    private meshIndex: number | null = null;
    private parentIndex: number | null = null;

    private rotation: quat;
    private scale: vec3;
    private translation: vec3;

    private defaultScale: vec3;
    private defaultRotation: quat;
    private defaultTranslation: vec3;

    private updateSubscribers: UpdateSubscriberCb[] = [];

    constructor(
        bone: GLTFNode,
        selfIndex: number,
        parentIndex = null as number | null
    ) {
        const {
            rotation = [0, 0, 0, 1],
            scale = [1, 1, 1],
            translation = [0, 0, 0],
            matrix = mat4.create(),
            skin = null,
            children = [],
            mesh = null,
        } = bone;

        this.skin = skin;
        this.childrenIndexes = children;
        this.parentIndex = parentIndex;
        this.meshIndex = mesh;
        this.selfIndex = selfIndex;

        this.rotation = rotation;
        this.scale = scale;
        this.translation = translation;
        this.initMatrix = matrix;

        this.defaultRotation = rotation;
        this.defaultScale = scale;
        this.defaultTranslation = translation;

        this.worldMatrix = mat4.create();
        this.calculateLocal();
    }

    public copy() {
        return new Bone(
            {
                rotation: quat.copy(quat.create(), this.rotation),
                scale: vec3.copy(vec3.create(), this.scale),
                translation: vec3.copy(vec3.create(), this.translation),
                matrix: mat4.copy(mat4.create(), this.initMatrix),
                skin: this.skin ?? undefined,
                children: [...this.childrenIndexes],
                mesh: this.meshIndex ?? undefined,
            },
            this.selfIndex,
            this.parentIndex
        );
    }

    public default() {
        this.setTRS(
            this.defaultTranslation,
            this.defaultRotation,
            this.defaultScale
        );
    }

    public getMeshIndex() {
        return this.meshIndex;
    }

    public getSelfIndex() {
        return this.selfIndex;
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

    public getChildrenIndexes() {
        return this.childrenIndexes;
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

    public addUpdateSubscriber(cb: UpdateSubscriberCb) {
        this.updateSubscribers.push(cb);

        return unsubArr(this.updateSubscribers, (el) => el === cb);
    }

    public update(bones: Bone[], meshes: Mesh[]) {
        const parent =
            this.parentIndex === null ? null : bones[this.parentIndex];

        this.calculateWorldMatrix(parent, meshes);

        for (let i = 0; i < this.childrenIndexes.length; i++) {
            const childIndex = this.childrenIndexes[i];
            const child = bones[childIndex];
            child.update(bones, meshes);
        }
    }

    public calculateLocal() {
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

    private calculateWorldMatrix(parent: Bone | null, meshes: Mesh[]) {
        const parentMatrix = parent?.getWorldMatrix() ?? null;

        if (!parentMatrix) {
            mat4.copy(this.worldMatrix, this.localMatrix);
        } else {
            mat4.multiply(this.worldMatrix, parentMatrix, this.localMatrix);
        }

        if (this.meshIndex !== null) {
            meshes[this.meshIndex]
                ?.getTransform()
                .setModelMatrix(this.worldMatrix);
        }
    }
}
