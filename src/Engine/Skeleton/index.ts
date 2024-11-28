import { mat4 } from "gl-matrix";
import { Bone } from "../Bones/Bones";
import { DataTexture } from "../Programs/Texture/DataTexture";

export class Skeleton {
    private bones: Bone[];
    private bonesIndexes: number[];
    private inverseBindMatrices: number[];
    private skinningMatrices: Float32Array;
    private skeletonDataTexture: DataTexture | null = null;

    constructor(
        bones: Bone[],
        bonesIndexes: number[],
        inverseBindMatrices: number[]
    ) {
        this.bones = bones;
        this.bonesIndexes = bonesIndexes;
        this.inverseBindMatrices = inverseBindMatrices;
        this.calculateBones();
    }

    public getSkinningMatrices() {
        return this.skinningMatrices;
    }

    public update() {
        this.calculateBones();
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

    private calculateBones() {
        const numBones = this.getBonesCount();

        if (numBones === 0) {
            return;
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
            mat4.multiply(
                skinningMatrix,
                bone.getWorldMatrix(),
                inverseBindMatrix
            );

            skinningMatrices.set(skinningMatrix, start);
        }

        this.skinningMatrices = skinningMatrices;

        // 1 matrice row = 1 texel (RGBA = vec4)
        this.skeletonDataTexture?.update(skinningMatrices, 4, numBones);
    }
}
