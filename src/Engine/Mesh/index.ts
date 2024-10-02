import { mat4, vec3 } from "gl-matrix";
import { MeshPrimitive } from "../MeshPrimitive";
import { Bone } from "../Bones/Bones";
import { AABB } from "../AABB";
import { PointLight } from "../Light/PointLight";

interface MeshSekeleton {
    matrices: Float32Array;
}

export class Mesh {
    private aabb: AABB;

    private primitives: MeshPrimitive[] = [];
    private bonesIndexes: number[];
    private inverseBindMatrices: number[];
    private bones: Bone[] = [];
    private skeleton: MeshSekeleton | null = null;

    private light: PointLight | null = null;

    constructor(
        primitives: MeshPrimitive[],
        skeleton: {
            bonesIndexes: number[];
            inverseBindMatrices: number[];
        } | null = null,
        bones: Bone[] = []
    ) {
        this.bones = bones;
        this.bonesIndexes = skeleton?.bonesIndexes ?? [];
        this.inverseBindMatrices = skeleton?.inverseBindMatrices ?? [];
        this.primitives = primitives;

        this.createAABB();
        this.calculateBones();
    }

    public update() {
        this.calculateBones();
    }

    public setLight(light: PointLight | null) {
        this.light = light;
    }

    public getLight() {
        return this.light;
    }

    public getPrimitives() {
        return this.primitives;
    }

    public getAABB() {
        return this.aabb;
    }

    public getSkeleton() {
        return this.skeleton;
    }

    private calculateBones() {
        const numBones = this.bonesIndexes.length;

        if (numBones === 0) {
            this.skeleton = null;
            return;
        }

        const skinningsMatrices: Float32Array = new Float32Array(16 * numBones);

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

            skinningsMatrices.set(skinningMatrix, start);
        }

        this.skeleton = {
            matrices: skinningsMatrices,
        };
    }

    private createAABB() {
        let max = null as vec3 | null;
        let min = null as vec3 | null;

        this.primitives.forEach((prim) => {
            const aabb = prim.getAABB();
            const maxMin = aabb.getMaxMin();

            if (max && min) {
                vec3.max(max, max, maxMin.max);
                vec3.min(min, min, maxMin.min);
            } else {
                max = vec3.fromValues(
                    maxMin.max[0],
                    maxMin.max[1],
                    maxMin.max[2]
                );
                min = vec3.fromValues(
                    maxMin.min[0],
                    maxMin.min[1],
                    maxMin.min[2]
                );
            }
        });

        this.aabb = new AABB(max as number[], min as number[]);
    }
}
