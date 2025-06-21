import { vec3 } from "gl-matrix";
import { AABB } from "engine/AABB";
import { Skeleton } from "engine/Skeleton";
import { unsubArr } from "engine/Utils/Utils";
import { MeshPrimitive } from "engine/MeshPrimitive";
import { PointLight } from "engine/Light/PointLight";
import { Transform } from "engine/Transform/Transform";
import { Bone } from "engine/Bones/Bones";

type UpdateAABBSubscriberCb = (mesh: Mesh) => void;

export class Mesh {
    protected webgl: WebGL2RenderingContext | null = null;

    protected aabb: AABB;

    protected primitives: MeshPrimitive[] = [];
    protected skeleton: Skeleton | null = null;

    protected light: PointLight | null = null;

    protected transform: Transform;

    protected updateAABBSubscribers: UpdateAABBSubscriberCb[] = [];

    constructor(primitives: MeshPrimitive[], skeleton: Skeleton | null = null) {
        this.skeleton = skeleton;
        this.primitives = primitives;

        this.transform = new Transform();

        this.createAABB();
        this.updateAABB();

        this.transform.subscribe(() => {
            this.updateAABB();
            this.light?.setPosition(this.transform.getGlobalPosition());
        });
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.webgl = webgl;
        this.primitives.forEach((prim) => prim._setWebGl(webgl));
        this.skeleton?._setWebGl(webgl);
    }

    public update() {
        this.skeleton?.update();
    }

    public addUpdateAABBSubscriber(cb: UpdateAABBSubscriberCb) {
        this.updateAABBSubscribers.push(cb);

        return unsubArr(this.updateAABBSubscribers, (el) => el === cb);
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
        this.skeleton?.__setMesh(this);

        this.createAABB();
        this.updateAABB();
    }

    public getTransform() {
        return this.transform;
    }

    public updateAABB() {
        if (this.skeleton) {
            this.updateSkinnedAABB();
        }

        this.aabb.updateByModelMatrix(this.transform.getGlobalModelMatrix());
        this.publishUpdateAABB();
    }

    public copy(bones: Bone[]) {
        const copiedPrimitives = this.primitives.map((primitive) =>
            primitive.copy()
        );

        const self = new Mesh(copiedPrimitives);

        const copiedSkeleton = this.skeleton?.copy(bones) ?? null;

        self.setSkeleton(copiedSkeleton);

        return self;
    }

    protected publishUpdateAABB() {
        this.updateAABBSubscribers.forEach((cb) => cb(this));
    }

    protected updateSkinnedAABB() {
        const aabb = this._getSkinnedAABBFromPrimitives();

        if (aabb) {
            this.aabb = aabb;
        }
    }

    protected _getSkinnedAABBFromPrimitives() {
        if (!this.skeleton) {
            return null;
        }

        const skinningMatrices = this.skeleton.getSkinningMatrices();

        if (!skinningMatrices || skinningMatrices.length === 0) return null;

        const aabbMin = vec3.fromValues(Infinity, Infinity, Infinity);
        const aabbMax = vec3.fromValues(-Infinity, -Infinity, -Infinity);

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

                vec3.min(aabbMin, aabbMin, transformedVertex);
                vec3.max(aabbMax, aabbMax, transformedVertex);
            }
        });

        return new AABB(aabbMax, aabbMin);
    }

    protected createAABB() {
        const skinnedAABB = this._getSkinnedAABBFromPrimitives();

        if (skinnedAABB) {
            this.aabb = skinnedAABB;

            return;
        }

        const primitiveAABBMin = vec3.fromValues(Infinity, Infinity, Infinity);
        const primitiveAABBMax = vec3.fromValues(
            -Infinity,
            -Infinity,
            -Infinity
        );

        this.primitives.forEach((primitive) => {
            const { max, min } = primitive.getAABB().getMaxMin();

            vec3.min(primitiveAABBMin, primitiveAABBMin, min);
            vec3.max(primitiveAABBMax, primitiveAABBMax, max);
        });

        this.aabb = new AABB(primitiveAABBMax, primitiveAABBMin);
    }
}
