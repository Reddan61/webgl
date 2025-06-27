import { Bone } from "engine/Bones/Bones";
import { Mesh } from "engine/Mesh";
import { DataTexture } from "engine/Programs/Texture/DataTexture";
import { mat4 } from "gl-matrix";

export class Skin {
    private rootJoint: number;
    private joints: number[];
    private inverseBindMatrices: number[];
    private skinningMatrices: Float32Array;
    private skeletonDataTexture: DataTexture | null = null;

    constructor(
        rootJoint: number,
        joints: number[],
        inverseBindMatrices: number[]
    ) {
        this.rootJoint = rootJoint;
        this.joints = joints;
        this.inverseBindMatrices = inverseBindMatrices;
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.skeletonDataTexture = new DataTexture(webgl);
        this.skeletonDataTexture?.update(
            this.skinningMatrices,
            4,
            this.joints.length
        );
    }

    public getBonesDataTexture() {
        return this.skeletonDataTexture;
    }

    public copy() {
        return new Skin(
            this.rootJoint,
            [...this.joints],
            [...this.inverseBindMatrices]
        );
    }

    public getRootJoint() {
        return this.rootJoint;
    }

    public getSkinningMatrices() {
        return this.skinningMatrices;
    }

    public getJointsCount() {
        return this.joints.length;
    }

    public update(bones: Bone[], mesh: Mesh) {
        this.calculateBones(bones, mesh);
    }

    protected calculateBones(bones: Bone[], mesh: Mesh) {
        const numJoints = this.joints.length;

        if (numJoints === 0) {
            return;
        }

        let meshWorldInverse = mat4.create();

        const meshWorldMatrix = mesh.getTransform().getLocalModelMatrix();
        mat4.invert(meshWorldInverse, meshWorldMatrix);

        const skinningMatrices: Float32Array = new Float32Array(16 * numJoints);

        for (let i = 0; i < numJoints; i++) {
            const bone = bones[this.joints[i]];
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
        this.skeletonDataTexture?.update(skinningMatrices, 4, numJoints);
    }
}
