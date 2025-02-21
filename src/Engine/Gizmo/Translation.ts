import { GizmoType } from "engine/Gizmo/GizmoType";
import { Mesh } from "engine/Mesh";
import { Object } from "engine/Object";
import { Ray } from "engine/Ray";
import { createArrow } from "engine/Utils/CreateObjects/createArrow";
import { getNearPointOnRay } from "engine/Utils/MathUtilsFunc";
import { AXIS_ENUM } from "engine/Utils/types";
import { vec3, vec4 } from "gl-matrix";

export class Translation extends GizmoType {
    private offset = null as vec3 | null;

    constructor() {
        const alpha = 1;

        const arrowZMesh = createArrow(vec4.fromValues(0, 0, 1, alpha));
        arrowZMesh.getTransform().setPosition([0, 0, 0.05]);
        const arrowYMesh = createArrow(vec4.fromValues(0, 1, 0, alpha));
        arrowYMesh
            .getTransform()
            .setPosition([0, 0.05, 0])
            .getRotation()
            .rotate(-90, 0);
        const arrowXMesh = createArrow(vec4.fromValues(1, 0, 0, alpha));
        arrowXMesh
            .getTransform()
            .setPosition([0.05, 0, 0])
            .getRotation()
            .rotate(0, 90);

        const meshes = [] as Mesh[];
        meshes[AXIS_ENUM.X] = arrowXMesh;
        meshes[AXIS_ENUM.Y] = arrowYMesh;
        meshes[AXIS_ENUM.Z] = arrowZMesh;
        const model = new Object(meshes, [0, 0, 0], [1, 1, 1]);
        model.setSingleFace(true);

        super(model);
    }

    public select(_: Object, ray: Ray, selectedAxis: AXIS_ENUM) {
        const objectPos = this.model.getTransform().getPosition();

        const intersection = getNearPointOnRay(ray, objectPos, selectedAxis);

        if (!intersection) {
            return;
        }

        this.offset = vec3.sub(vec3.create(), objectPos, intersection);
    }

    public move(object: Object, ray: Ray, selectedAxis: AXIS_ENUM) {
        if (!this.offset) return;

        const objectPos = this.model.getTransform().getPosition();

        const intersection = getNearPointOnRay(ray, objectPos, selectedAxis);

        if (intersection === null) return;

        const nextPoint = vec3.create();

        vec3.add(nextPoint, intersection, this.offset);

        this.change(object, selectedAxis, nextPoint);
    }

    private change(object: Object, selectedAxis: AXIS_ENUM, nextPoint: vec3) {
        const transform = object.getTransform();

        transform.setPositionByAxis(nextPoint[selectedAxis], selectedAxis);

        this.model.getTransform().setPosition(transform.getPosition());
    }
}
