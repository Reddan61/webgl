import { GizmoType } from "engine/Gizmo/GizmoType";
import { Mesh } from "engine/Mesh";
import { Object } from "engine/Object";
import { createScalingArrow } from "engine/Utils/CreateObjects/createScalingArrow";
import { AXIS_ENUM } from "engine/Utils/types";
import { vec3, vec4 } from "gl-matrix";

export class Scale extends GizmoType {
    private initScale = null as vec3 | null;

    constructor() {
        const alpha = 1;

        const arrowZMesh = createScalingArrow(vec4.fromValues(0, 0, 1, alpha));
        arrowZMesh.getTransform().setPosition([0, 0, 0.05]);
        const arrowYMesh = createScalingArrow(vec4.fromValues(0, 1, 0, alpha));
        arrowYMesh.getTransform().rotate(-90, 0).setPosition([0, 0.05, 0]);
        const arrowXMesh = createScalingArrow(vec4.fromValues(1, 0, 0, alpha));
        arrowXMesh.getTransform().rotate(0, 90).setPosition([0.05, 0, 0]);

        const meshes = [] as Mesh[];
        meshes[AXIS_ENUM.X] = arrowXMesh;
        meshes[AXIS_ENUM.Y] = arrowYMesh;
        meshes[AXIS_ENUM.Z] = arrowZMesh;

        const model = new Object(meshes, [0, 0, 0], [1, 1, 1]);
        model.setSingleFace(true);

        super(model);
    }

    public change(object: Object, selectedAxis: AXIS_ENUM, nextPoint: vec3) {
        if (!this.initScale) return;

        const transform = object.getTransform();
        const objectPos = transform.getPosition();

        const sensitivity = 0.1;
        const pointOffset = nextPoint[selectedAxis] - objectPos[selectedAxis];

        const nextScaling =
            this.initScale[selectedAxis] + pointOffset * sensitivity;

        transform.setScalingByAxis(nextScaling, selectedAxis);
    }

    public update(object: Object) {
        this.initScale = vec3.copy(
            vec3.create(),
            object.getTransform().getScaling()
        );
    }
}
