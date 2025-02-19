import { Object } from "engine/Object";
import { AXIS_ENUM } from "engine/Utils/types";
import { vec3 } from "gl-matrix";

export abstract class GizmoType {
    protected model: Object;

    constructor(model: Object) {
        this.model = model;
    }

    public getModel() {
        return this.model;
    }

    public change(object: Object, selectedAxis: AXIS_ENUM, nextPoint: vec3) {}

    public update(object: Object) {}
}
