import { vec3 } from "gl-matrix";
import {
    LineProgramIndices,
    LineProgramVertices,
} from "../Programs/LineProgram";
import { Engine } from "engine/Engine";

interface Line {
    vertices: LineProgramVertices;
    indices: LineProgramIndices;
}

export class Ray {
    private start: vec3;
    private end: vec3;
    private direction: vec3;
    private distance: number;
    private line: Line;

    constructor(start: vec3, direction: vec3) {
        this.direction = direction;
        this.start = start;
        this.distance = Engine.getScene()?.getCamera().getFarPlane() ?? 200;
        this.end = vec3.create();
        vec3.scaleAndAdd(this.end, this.start, this.direction, this.distance);
        this.line = this.createLine();
    }

    public getLine() {
        return this.line;
    }

    public getDirection() {
        return this.direction;
    }

    public getOrigin() {
        return this.start;
    }

    private createLine() {
        const vertices: Line["vertices"] = new Float32Array([
            this.start[0],
            this.start[1],
            this.start[2],
            this.end[0],
            this.end[1],
            this.end[2],
        ]);

        const indices: Line["indices"] = new Uint16Array([0, 1]);

        const line: Line = {
            vertices,
            indices,
        };

        return line;
    }
}
