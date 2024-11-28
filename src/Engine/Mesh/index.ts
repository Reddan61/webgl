import { mat4, vec3 } from "gl-matrix";
import { MeshPrimitive } from "../MeshPrimitive";
import { AABB } from "../AABB";
import { PointLight } from "../Light/PointLight";
import { Skeleton } from "../Skeleton";

export class Mesh {
    private webgl: WebGL2RenderingContext | null = null;

    private aabb: AABB;

    private primitives: MeshPrimitive[] = [];
    private skeleton: Skeleton | null = null;

    private light: PointLight | null = null;

    private modelMatrix = mat4.create();

    constructor(primitives: MeshPrimitive[], skeleton: Skeleton | null = null) {
        this.skeleton = skeleton;
        this.primitives = primitives;

        this.createAABB();
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.webgl = webgl;
        this.skeleton?._setWebGl(webgl);
    }

    public update() {
        this.skeleton?.update();
        this.createAABB();
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

    public setSkeleton(skeleton: Skeleton | null) {
        this.skeleton = skeleton;
        this.createAABB();
    }

    public setModelMatrix(matrix: mat4) {
        this.modelMatrix = matrix;
        this.createAABB();
    }

    public getModelMatrix() {
        return this.modelMatrix;
    }

    private _getSkinnedAABBFromPrimitives() {
        if (!this.skeleton) {
            return null;
        }

        const skinningMatrices = this.skeleton.getSkinningMatrices();

        const aabb = new AABB(
            vec3.fromValues(-Infinity, -Infinity, -Infinity),
            vec3.fromValues(Infinity, Infinity, Infinity)
        );

        this.primitives.forEach((primitive) => {
            const vertices = primitive.getVertices();
            const joints = primitive.getJoints();
            const weights = primitive.getWeights();

            for (let i = 0; i < vertices.length / 3; i++) {
                const offset = i * 3;
                const vertex = vec3.fromValues(
                    vertices[offset],
                    vertices[offset + 1],
                    vertices[offset + 2]
                );

                const transformedVertex = vec3.create();

                for (let j = 0; j < 4; j++) {
                    const jOffset = i * 4 + j;

                    const weight = weights[jOffset];
                    const joint = joints[jOffset];

                    if (weight > 0) {
                        const start = joint * 16;
                        const jointMatrix = skinningMatrices.slice(
                            start,
                            start + 16
                        );

                        const localVertex = vec3.create();
                        vec3.transformMat4(localVertex, vertex, jointMatrix);

                        vec3.scaleAndAdd(
                            transformedVertex,
                            transformedVertex,
                            localVertex,
                            weight
                        );
                    }
                }

                aabb.checkMin(transformedVertex);
                aabb.checkMax(transformedVertex);
            }
        });

        return aabb;
    }

    private createAABB() {
        const skinnedAABB = this._getSkinnedAABBFromPrimitives();

        if (skinnedAABB) {
            this.aabb = skinnedAABB;

            return;
        }

        const primitiveAABB = new AABB(
            vec3.fromValues(-Infinity, -Infinity, -Infinity),
            vec3.fromValues(Infinity, Infinity, Infinity)
        );

        this.primitives.forEach((primitive) => {
            const aabb = primitive.getAABB();
            primitiveAABB.minMaxAABB(aabb);
        });

        const corners = primitiveAABB.getCorners();

        const resultAABB = new AABB(
            vec3.fromValues(-Infinity, -Infinity, -Infinity),
            vec3.fromValues(Infinity, Infinity, Infinity)
        );

        corners.forEach((corner) => {
            const transformedCorner = vec3.transformMat4(
                vec3.create(),
                corner,
                this.modelMatrix
            );

            resultAABB.checkMax(transformedCorner);
            resultAABB.checkMin(transformedCorner);
        });

        this.aabb = resultAABB;
    }
}
