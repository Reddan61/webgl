import { vec3 } from "gl-matrix";
import { Ray } from "engine/Ray";
import { Hit } from "engine/AABB";
import { Mesh } from "engine/Mesh";
import { unsubArr } from "engine/Utils/Utils";
import { EngineObject } from "engine/EngineObject";

interface SelectedObject {
    entity: {
        object: EngineObject;
        mesh: Mesh;
        hit: Hit;
    } | null;
    lastSelected: {
        object: EngineObject;
        mesh: Mesh;
    } | null;
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

        return unsubArr(this.onChange, (el) => el === func);
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

    public select(ray: Ray, objects: EngineObject[]) {
        this.rays[0] = ray;

        this.selected = this.objectHit(ray, objects);
        this.publish();
    }

    public setSelect(object: EngineObject) {
        this.selected = {
            entity: {
                object,
                mesh: object.getMeshes()[0],
                hit: {
                    far: 0,
                    near: 0,
                    point: vec3.create(),
                },
            },
            lastSelected: this.selected.entity ?? null,
        };

        this.publish();
    }

    private objectHit(ray: Ray, objects: EngineObject[]): SelectedObject {
        const nearest = {
            distToHit: Infinity,
            entity: null as {
                object: EngineObject;
                mesh: Mesh;
                hit: Hit;
            } | null,
        };

        objects.forEach((object) => {
            const objectHit = object.getAABB().hit(ray);

            if (!objectHit) return;

            const nearestMesh = {
                distToHit: Infinity,
                mesh: null as Mesh | null,
                hit: null as Hit | null,
            };

            object.getMeshes().forEach((mesh) => {
                const aabb = mesh.getAABB();

                const hit = aabb.hit(ray);

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
}
