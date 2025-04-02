import { mat4, vec3 } from "gl-matrix";
import { Ray } from "engine/Ray";

export interface Hit {
    near: number;
    far: number;
    point: vec3;
}

export class AABB {
    private vertices: Float32Array;
    private indices: Uint16Array;
    private max: vec3;
    private min: vec3;

    private withModelMatrixMax: vec3;
    private withModelMatrixMin: vec3;

    constructor(max: vec3, min: vec3) {
        this.max = max;
        this.min = min;

        this.withModelMatrixMax = vec3.copy(vec3.create(), this.max);
        this.withModelMatrixMin = vec3.copy(vec3.create(), this.min);

        this.createGeometry();
    }

    public getMaxMin() {
        return {
            min: this.withModelMatrixMin,
            max: this.withModelMatrixMax,
        };
    }

    public updateByModelMatrix(modelMatrix: mat4) {
        const transformedMin = vec3.fromValues(Infinity, Infinity, Infinity);
        const transformedMax = vec3.fromValues(-Infinity, -Infinity, -Infinity);
        const corners = this.getCorners();

        corners.forEach((corner) => {
            const temp = vec3.transformMat4(vec3.create(), corner, modelMatrix);

            vec3.min(transformedMin, transformedMin, temp);
            vec3.max(transformedMax, transformedMax, temp);
        });

        this.withModelMatrixMax = transformedMax;
        this.withModelMatrixMin = transformedMin;

        this.createGeometry();
    }

    public hit(ray: Ray): Hit | null {
        const invDirection = vec3.create();
        vec3.inverse(invDirection, ray.getDirection());
        const tMin = vec3.create();
        const tMax = vec3.create();
        const { max, min } = this.getMaxMin();

        vec3.subtract(tMin, min, ray.getOrigin());
        vec3.multiply(tMin, tMin, invDirection);

        vec3.subtract(tMax, max, ray.getOrigin());
        vec3.multiply(tMax, tMax, invDirection);

        const t1 = vec3.create();
        const t2 = vec3.create();

        vec3.min(t1, tMin, tMax);
        vec3.max(t2, tMin, tMax);

        const near = Math.max(t1[0], Math.max(t1[1], t1[2]));
        const far = Math.min(t2[0], Math.min(t2[1], t2[2]));

        if (near > far || far < 0.0) {
            return null;
        }

        const point = vec3.create();

        vec3.scaleAndAdd(point, ray.getOrigin(), ray.getDirection(), near);

        return {
            near,
            far,
            point,
        };
    }

    public getVertices() {
        return this.vertices;
    }

    public getIndices() {
        return this.indices;
    }

    private getCorners() {
        return [
            vec3.fromValues(this.min[0], this.min[1], this.min[2]),
            vec3.fromValues(this.max[0], this.min[1], this.min[2]),
            vec3.fromValues(this.min[0], this.max[1], this.min[2]),
            vec3.fromValues(this.max[0], this.max[1], this.min[2]),
            vec3.fromValues(this.min[0], this.min[1], this.max[2]),
            vec3.fromValues(this.max[0], this.min[1], this.max[2]),
            vec3.fromValues(this.min[0], this.max[1], this.max[2]),
            vec3.fromValues(this.max[0], this.max[1], this.max[2]),
        ];
    }

    private createGeometry() {
        const { max, min } = this.getMaxMin();

        this.indices = new Uint16Array([
            0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3,
            7,
        ]);
        this.vertices = new Float32Array([
            min[0],
            min[1],
            min[2],
            max[0],
            min[1],
            min[2],
            max[0],
            max[1],
            min[2],
            min[0],
            max[1],
            min[2],
            min[0],
            min[1],
            max[2],
            max[0],
            min[1],
            max[2],
            max[0],
            max[1],
            max[2],
            min[0],
            max[1],
            max[2],
        ]);
    }
}
