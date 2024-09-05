import { vec3 } from "gl-matrix";

export class AABB {
    private vertices: Float32Array;
    private indices: Uint16Array;
    private max: vec3;
    private min: vec3;

    constructor(max: number[], min: number[]) {
        this.max = max as vec3;
        this.min = min as vec3;

        this.createGeometry();
    }

    public getMaxMin() {
        return {
            min: this.min,
            max: this.max,
        };
    }

    public getVertices() {
        return this.vertices;
    }

    public getIndices() {
        return this.indices;
    }

    private createGeometry() {
        this.indices = new Uint16Array([
            0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3,
            7,
        ]);
        this.vertices = new Float32Array([
            this.min[0],
            this.min[1],
            this.min[2],
            this.max[0],
            this.min[1],
            this.min[2],
            this.max[0],
            this.max[1],
            this.min[2],
            this.min[0],
            this.max[1],
            this.min[2],
            this.min[0],
            this.min[1],
            this.max[2],
            this.max[0],
            this.min[1],
            this.max[2],
            this.max[0],
            this.max[1],
            this.max[2],
            this.min[0],
            this.max[1],
            this.max[2],
        ]);
    }
}
