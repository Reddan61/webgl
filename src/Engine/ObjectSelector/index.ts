import { vec3, vec4 } from "gl-matrix";
import { Object } from "../Object";
import { Ray } from "../Ray";
import { AABB } from "../AABB";
import { Mesh } from "engine/Mesh";

interface SelectedObject {
    entity: {
        object: Object;
        mesh: Mesh;
        hit: Hit;
    } | null;
    lastSelected: {
        object: Object;
        mesh: Mesh;
    } | null;
}

interface Hit {
    near: number;
    far: number;
    point: vec3;
}

type OnChange = (selected: SelectedObject) => void;

export class ObjectSelector {
    private rays: Ray[] = [];
    private selected: SelectedObject = {
        lastSelected: null,
        entity: null,
    };
    private onChange: OnChange[] = [];

    constructor() {}

    public getRays() {
        return this.rays;
    }

    public addOnChange(func: OnChange) {
        this.onChange.push(func);
    }

    private publish() {
        this.onChange.forEach((func) => {
            func(this.selected);
        });
    }

    public getSelected() {
        return this.selected;
    }

    public clear() {
        this.selected = {
            lastSelected: null,
            entity: null,
        };
        this.publish();
    }

    public select(ray: Ray, objects: Object[]) {
        this.rays[0] = ray;

        this.selected = this.objectHit(ray, objects);
        this.publish();
    }

    private objectHit(ray: Ray, objects: Object[]): SelectedObject {
        const nearest = {
            distToHit: Infinity,
            entity: null as {
                object: Object;
                mesh: Mesh;
                hit: Hit;
            } | null,
        };

        objects.forEach((object) => {
            const nearestMesh = {
                distToHit: Infinity,
                mesh: null as Mesh | null,
                hit: null as Hit | null,
            };

            object.getMeshes().forEach((mesh) => {
                const model = object.getMeshModelMatrix(mesh);

                const aabb = mesh.getAABB();
                const { max, min } = aabb.getMaxMin();
                // get world coords of aabb
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

                if (hit.near < nearestMesh.distToHit) {
                    nearestMesh.distToHit = hit.near;
                    nearestMesh.hit = hit;
                    nearestMesh.mesh = mesh;
                }
            });

            if (nearestMesh.distToHit < nearest.distToHit) {
                nearest.distToHit = nearestMesh.distToHit;

                if (nearestMesh.mesh) {
                    nearest.entity = {
                        ...(nearest.entity ?? {}),
                        hit: nearestMesh.hit as Hit,
                        object,
                        mesh: nearestMesh.mesh,
                    };
                }
            }
        });

        return {
            entity: nearest.entity,
            lastSelected: nearest.entity ?? this.selected?.entity ?? null,
        };
    }

    private aabbHit(ray: Ray, aabb: AABB): Hit | null {
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

        const point = vec3.create();

        vec3.scaleAndAdd(point, ray.getOrigin(), ray.getDirection(), near);

        return {
            near,
            far,
            point,
        };
    }
}
