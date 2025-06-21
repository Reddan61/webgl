import { mat4 } from "gl-matrix";
import { Mesh } from "engine/Mesh";
import { Bone } from "engine/Bones/Bones";
import { unsubArr } from "engine/Utils/Utils";
import { DataTexture } from "engine/Programs/Texture/DataTexture";

type UpdateSubscriberCb = () => void;

export class Skeleton {
    private someBoneChanged = false;

    private bones: Bone[];
    private mesh: Mesh | null;
    private bonesIndexes: number[];
    private inverseBindMatrices: number[];
    private skinningMatrices: Float32Array;
    private skeletonDataTexture: DataTexture | null = null;

    private updateSubscribers: UpdateSubscriberCb[] = [];

    constructor(
        bones: Bone[],
        bonesIndexes: number[],
        inverseBindMatrices: number[]
    ) {
        this.bones = bones;
        this.bonesIndexes = bonesIndexes;
        this.inverseBindMatrices = inverseBindMatrices;
        this.calculateBones();
        this.subscribe();
    }

    public setBones(bones: Bone[]) {
        this.bones = bones;

        this.calculateBones();
        this.subscribe();
    }

    public copy(bones: Bone[]) {
        return new Skeleton(
            bones,
            [...this.bonesIndexes],
            [...this.inverseBindMatrices]
        );
    }

    public getSkinningMatrices() {
        return this.skinningMatrices;
    }

    public __setMesh(mesh: Mesh) {
        this.mesh = mesh;
        this.calculateBones();
    }

    public update() {
        if (this.someBoneChanged) {
            this.calculateBones();
            this.someBoneChanged = false;
        }
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.skeletonDataTexture = new DataTexture(webgl);
        this.skeletonDataTexture?.update(
            this.skinningMatrices,
            4,
            this.getBonesCount()
        );
    }

    public getBonesDataTexture() {
        return this.skeletonDataTexture;
    }

    public getBonesCount() {
        return this.bonesIndexes.length;
    }

    public addUpdateSubscriber(cb: UpdateSubscriberCb) {
        this.updateSubscribers.push(cb);

        return unsubArr(this.updateSubscribers, (el) => el === cb);
    }

    private subscribe() {
        if (this.bones.length === 0) return;

        this.bonesIndexes.forEach((index) =>
            this.bones[index].addUpdateSubscriber(() => {
                this.someBoneChanged = true;
            })
        );
    }

    private calculateBones() {
        const numBones = this.getBonesCount();

        if (numBones === 0 || this.bones.length === 0) {
            return;
        }

        let meshWorldInverse = mat4.create();

        if (this.mesh) {
            const meshWorldMatrix = this.mesh
                .getTransform()
                .getLocalModelMatrix();
            mat4.invert(meshWorldInverse, meshWorldMatrix);
        }

        const skinningMatrices: Float32Array = new Float32Array(16 * numBones);

        for (let i = 0; i < numBones; i++) {
            const bone = this.bones[this.bonesIndexes[i]];
            const start = i * 16;
            const end = start + 16;

            const inverseBindMatrix = new Float32Array(
                this.inverseBindMatrices.slice(start, end)
            );

            const skinningMatrix = mat4.create();

            const boneWorld = bone.getWorldMatrix();
            const localBoneMatrix = mat4.multiply(
                mat4.create(),
                meshWorldInverse,
                boneWorld
            );
            mat4.multiply(skinningMatrix, localBoneMatrix, inverseBindMatrix);

            skinningMatrices.set(skinningMatrix, start);
        }

        this.skinningMatrices = skinningMatrices;

        // 1 matrice row = 1 texel (RGBA = vec4)
        this.skeletonDataTexture?.update(skinningMatrices, 4, numBones);

        this.mesh?.updateAABB();
    }
}
