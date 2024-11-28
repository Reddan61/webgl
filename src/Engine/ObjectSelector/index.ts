import { vec3, vec4 } from "gl-matrix";
import { Camera } from "../Camera";
import { Object } from "../Object";
import { Ray } from "../Ray";
import { Rays } from "../Rays";
import { AABB } from "../AABB";

interface SelectedObject {
    object: Object;
    distanceToObject: number;
}

export class ObjectSelector {
    private camera: Camera;
    private canvas: HTMLCanvasElement;
    private rays: Ray[] = [];
    private selected: SelectedObject | null = null;

    constructor(canvas: HTMLCanvasElement, camera: Camera) {
        this.camera = camera;
        this.canvas = canvas;
    }

    public getRays() {
        return this.rays;
    }

    public getSelected() {
        return this.selected;
    }

    public clear() {
        this.selected = null;
    }

    public select(screenX: number, screenY: number, objects: Object[]) {
        const ray = Rays.RayCast(screenX, screenY, this.canvas, this.camera);

        this.rays[0] = ray;

        this.selected = this.objectHit(ray, objects);
    }

    private objectHit(ray: Ray, objects: Object[]): SelectedObject | null {
        const nearest = {
            distToHit: Infinity,
            object: null as Object | null,
        };

        objects.forEach((object) => {
            const model = object.getModelMatrix();

            const aabb = object.getAABB();
            const { max, min } = aabb.getMaxMin();
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

            const hitAABB = new AABB(
                vec3.fromValues(convMax[0], convMax[1], convMax[2]),
                vec3.fromValues(convMin[0], convMin[1], convMin[2])
            );

            const hit = this.aabbHit(ray, hitAABB);

            if (!hit) return;

            if (hit.near < nearest.distToHit) {
                nearest.distToHit = hit.near;
                nearest.object = object;
            }
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
        vec3.inverse(invDirection, ray.getDirection());
        const tMin = vec3.create();
        const tMax = vec3.create();
        const { max, min } = aabb.getMaxMin();

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

        return {
            near,
            far,
        };
    }
}
