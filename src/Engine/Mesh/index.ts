import { vec3 } from "gl-matrix";
import { AABB } from "engine/AABB";
import { unsubArr } from "engine/Utils/Utils";
import { MeshPrimitive } from "engine/MeshPrimitive";
import { PointLight } from "engine/Light/PointLight";
import { Transform } from "engine/Transform/Transform";
import { Skin } from "engine/Skin";

type UpdateAABBSubscriberCb = (mesh: Mesh) => void;

export class Mesh {
    protected skinIndex: number | null = null;

    protected webgl: WebGL2RenderingContext | null = null;

    protected aabb: AABB;

    protected primitives: MeshPrimitive[] = [];

    protected light: PointLight | null = null;

    protected transform: Transform;

    protected updateAABBSubscribers: UpdateAABBSubscriberCb[] = [];

    constructor(primitives: MeshPrimitive[]) {
        this.primitives = primitives;

        this.transform = new Transform();

        this.createAABB(null);
        this.updateAABB(null);

        this.transform.subscribe(() => {
            this.updateAABB(null);
            this.light?.setPosition(this.transform.getGlobalPosition());
        });
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.webgl = webgl;
        this.primitives.forEach((prim) => prim._setWebGl(webgl));
    }

    public update() {}

    public setSkin(skinIndex: Mesh["skinIndex"]) {
        this.skinIndex = skinIndex;
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

    public getSkinIndex() {
        return this.skinIndex;
    }

    public getTransform() {
        return this.transform;
    }

    public updateAABB(skin: Skin | null) {
        this.updateSkinnedAABB(skin);

        this.aabb.updateByModelMatrix(this.transform.getGlobalModelMatrix());
        this.publishUpdateAABB();
    }

    public copy() {
        const copiedPrimitives = this.primitives.map((primitive) =>
            primitive.copy()
        );

        const self = new Mesh(copiedPrimitives);
        self.setSkin(this.skinIndex);

        return self;
    }

    protected publishUpdateAABB() {
        this.updateAABBSubscribers.forEach((cb) => cb(this));
    }

    protected updateSkinnedAABB(skin: Skin | null) {
        const aabb = this._getSkinnedAABBFromPrimitives(skin);

        if (aabb) {
            this.aabb = aabb;
        }
    }

    protected _getSkinnedAABBFromPrimitives(skin: Skin | null) {
        if (!skin) {
            return null;
        }

        const skinningMatrices = skin.getSkinningMatrices();

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

    protected createAABB(skin: Skin | null) {
        const skinnedAABB = this._getSkinnedAABBFromPrimitives(skin);

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
