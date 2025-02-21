import { GizmoType } from "engine/Gizmo/GizmoType";
import { Mesh } from "engine/Mesh";
import { Object } from "engine/Object";
import { Ray } from "engine/Ray";
import { createHollowCircle } from "engine/Utils/CreateObjects/createHollowCircle";
import {
    getAngleDegByTwoPointsWithOrigin,
    getAxisPlaneIntersection,
} from "engine/Utils/MathUtilsFunc";
import { AXIS_ENUM } from "engine/Utils/types";
import { vec3, vec4 } from "gl-matrix";

export class Rotate extends GizmoType {
    private startIntersection = null as vec3 | null;

    constructor() {
        const alpha = 1;
        const innerRadius = 1;
        const outerRadius = 1.1;
        const thickness = 0.08;
        const segments = 32;

        const circleZMesh = createHollowCircle(
            vec4.fromValues(0, 0, 1, alpha),
            innerRadius,
            outerRadius,
            thickness,
            segments
        );
        const circleXMesh = createHollowCircle(
            vec4.fromValues(1, 0, 0, alpha),
            innerRadius,
            outerRadius,
            thickness,
            segments
        );
        circleXMesh.getTransform().getRotation().rotate(0, -90);
        const circleYMesh = createHollowCircle(
            vec4.fromValues(0, 1, 0, alpha),
            innerRadius,
            outerRadius,
            thickness,
            segments
        );
        circleYMesh.getTransform().getRotation().rotate(90, 0);

        const meshes = [] as Mesh[];
        meshes[AXIS_ENUM.X] = circleXMesh;
        meshes[AXIS_ENUM.Y] = circleYMesh;
        meshes[AXIS_ENUM.Z] = circleZMesh;

        const model = new Object(meshes, [0, 0, 0], [1, 1, 1]);
        model.setSingleFace(true);

        super(model);
    }

    public select(_: Object, ray: Ray, selectedAxis: AXIS_ENUM) {
        const gizmoPos = this.model.getTransform().getPosition();

        const intersection = getAxisPlaneIntersection(
            ray,
            gizmoPos,
            selectedAxis
        );

        if (!intersection) {
            return;
        }

        this.startIntersection = intersection;
    }

    public move(object: Object, ray: Ray, selectedAxis: AXIS_ENUM) {
        if (!this.startIntersection) return;

        const objectPos = this.model.getTransform().getPosition();

        const intersection = getAxisPlaneIntersection(
            ray,
            objectPos,
            selectedAxis
        );

        if (!intersection) return;

        this.change(object, selectedAxis, intersection, this.startIntersection);

        this.startIntersection = intersection;
    }

    private change(
        object: Object,
        selectedAxis: AXIS_ENUM,
        intersection: vec3,
        startIntersection: vec3
    ) {
        const transform = object.getTransform();
        const objectPos = transform.getPosition();

        const angle = getAngleDegByTwoPointsWithOrigin(
            startIntersection,
            intersection,
            objectPos,
            selectedAxis
        );

        transform.getRotation().rotateAroundAxis(selectedAxis, angle);
    }
}
