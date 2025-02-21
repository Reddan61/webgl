import { Object } from "engine/Object";
import { Ray } from "engine/Ray";
import { AXIS_ENUM } from "engine/Utils/types";
import { vec3 } from "gl-matrix";

export abstract class GizmoType {
    private scale = vec3.fromValues(1, 1, 1);
    protected model: Object;

    constructor(model: Object) {
        this.model = model;
    }

    public getModel() {
        return this.model;
    }

    public move(object: Object, ray: Ray, selectedAxis: AXIS_ENUM) {}
    public select(object: Object, ray: Ray, selectedAxis: AXIS_ENUM) {}

    public update(object: Object) {}

    public getInitScale() {
        return this.scale;
    }
}
