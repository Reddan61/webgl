import { EngineObject } from "engine/EngineObject";
import { Ray } from "engine/Ray";
import { AXIS_ENUM } from "engine/Utils/types";
import { vec3 } from "gl-matrix";

export abstract class GizmoType {
    private scale = vec3.fromValues(1, 1, 1);
    protected model: EngineObject;

    constructor(model: EngineObject) {
        this.model = model;
    }

    public getModel() {
        return this.model;
    }

    public move(object: EngineObject, ray: Ray, selectedAxis: AXIS_ENUM) {}
    public select(object: EngineObject, ray: Ray, selectedAxis: AXIS_ENUM) {}

    public update(object: EngineObject) {}

    public getInitScale() {
        return this.scale;
    }
}
