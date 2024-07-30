import { mat4, vec3, vec4 } from "gl-matrix";
import { Camera } from "../Camera";
import {
    LineProgramIndices,
    LineProgramVertices,
} from "../Programs/LineProgram";
import { Object } from "../Object";

interface Ray {
    origin: vec3;
    direction: vec3;
}

interface AABB {
    max: vec3;
    min: vec3;
}

interface EditorLine {
    vertices: LineProgramVertices;
    indices: LineProgramIndices;
}

interface EditorSelected {
    object: Object;
    distanceToObject: number;
}

export class Editor {
    private modelMatrix: mat4;
    private camera: Camera;
    private canvas: HTMLCanvasElement;
    private objects: Object[] = [];
    private lines: EditorLine[] = [];
    private selected: EditorSelected | null = null;

    constructor(canvas: HTMLCanvasElement, camera: Camera, objects: Object[]) {
        this.camera = camera;
        this.canvas = canvas;
        this.objects = objects;

        this.modelMatrix = mat4.create();
        mat4.identity(this.modelMatrix);

        this.subscribe();
    }

    public getLines() {
        return this.lines;
    }

    public getModelMatrix() {
        return this.modelMatrix;
    }

    private subscribe() {
        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const x_gl = (x / rect.width) * 2 - 1;
            const y_gl = (y / rect.height) * -2 + 1;
            // позиция на экране
            const clip = vec4.fromValues(x_gl, y_gl, -1.0, 1.0);

            const view = this.camera.getView();
            const proj = this.camera.getProjection();

            // получение луча в мировых координатах
            const invProj = mat4.create();
            const invView = mat4.create();
            mat4.invert(invProj, proj);
            mat4.invert(invView, view);
            const eye = vec4.create();
            vec4.transformMat4(eye, clip, invProj);
            eye[2] = -1.0;
            eye[3] = 0.0;

            const world = vec4.create();
            vec4.transformMat4(world, eye, invView);

            // луч направления клика мышки
            const dir = vec3.fromValues(world[0], world[1], world[2]);
            vec3.normalize(dir, dir);

            const cameraPos = this.camera.getPosition();
            const end = vec3.create();
            const distance = 200;

            vec3.scaleAndAdd(end, cameraPos, dir, distance);

            this.lines[0] = this.createLine(cameraPos, end);

            this.selected = this.objectHit({
                direction: dir,
                origin: cameraPos,
            });
        });
    }

    private createLine(start: vec3, end: vec3) {
        const vertices: EditorLine["vertices"] = new Float32Array([
            start[0],
            start[1],
            start[2],
            end[0],
            end[1],
            end[2],
        ]);

        const indices: EditorLine["indices"] = new Uint16Array([0, 1]);

        const line: EditorLine = {
            vertices,
            indices,
        };

        return line;
    }

    private objectHit(ray: Ray): EditorSelected | null {
        const nearest = {
            distToHit: Infinity,
            object: null as Object | null,
        };

        this.objects.forEach((object) => {
            object.getContent().forEach(
                ({
                    geometry: {
                        vertices: { max, min },
                    },
                }) => {
                    const model = object.getModelMatrix();

                    // получение мировых координат aabb
                    const convMax = vec4.create();
                    const convMin = vec4.create();
                    vec4.transformMat4(
                        convMax,
                        vec4.fromValues(max[0], max[1], max[2], 1.0),
                        model
                    );
                    vec4.transformMat4(
                        convMin,
                        vec4.fromValues(min[0], min[1], min[2], 1.0),
                        model
                    );

                    const hit = this.aabbHit(ray, {
                        max: vec3.fromValues(
                            convMax[0],
                            convMax[1],
                            convMax[2]
                        ),
                        min: vec3.fromValues(
                            convMin[0],
                            convMin[1],
                            convMin[2]
                        ),
                    });

                    if (!hit) return;

                    if (hit.near < nearest.distToHit) {
                        nearest.distToHit = hit.near;
                        nearest.object = object;
                    }
                }
            );
        });

        return nearest.object
            ? {
                  distanceToObject: nearest.distToHit,
                  object: nearest.object,
              }
            : null;
    }

    private aabbHit(ray: Ray, aabb: AABB) {
        const invDirection = vec3.create();
        vec3.inverse(invDirection, ray.direction);
        const tMin = vec3.create();
        const tMax = vec3.create();

        vec3.subtract(tMin, aabb.min, ray.origin);
        vec3.multiply(tMin, tMin, invDirection);

        vec3.subtract(tMax, aabb.max, ray.origin);
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

        return {
            near,
            far,
        };
    }
}
