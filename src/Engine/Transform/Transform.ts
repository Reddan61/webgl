import { mat3, mat4, vec3 } from "gl-matrix";
import { Rotation } from "engine/Rotation";
import { AXIS_ENUM } from "engine/Utils/types";
import { unsubArr } from "engine/Utils/Utils";

type OnTransformSubscriberCb = (transform: Transform) => void;

export class Transform {
    private parentTransform: Transform | null = null;
    private unsubParentTransform: (() => void) | null = null;

    private position = vec3.create();
    private scaling = vec3.fromValues(1, 1, 1);

    private translation = mat4.create();
    private scalingMatrix = mat4.create();
    private transformMatrix = mat4.create();

    private currentModelMatrix = mat4.create();
    private replacedModelMatrix = mat4.create();
    private resultModelMatrix = mat4.create();

    private normalMatrix = mat3.create();

    private rotation: Rotation;

    private onTransformSubscribers: OnTransformSubscriberCb[] = [];

    constructor() {
        this.rotation = new Rotation();
        this.rotation.addOnChange(() => {
            this.calculateMatrix();
        });
        this.calculateMatrix();
    }

    public setParentTransform(transform: Transform | null) {
        this.unsubParentTransform?.();

        this.parentTransform = transform;
        this.publish();

        this.unsubParentTransform =
            this.parentTransform?.subscribe(() => {
                this.publish();
            }) ?? null;
    }

    public setPosition(position: vec3) {
        vec3.copy(this.position, position);
        this.calculateMatrix();

        return this;
    }

    public setPositionByAxis(value: number, axis: AXIS_ENUM) {
        this.position[axis] = value;
        this.calculateMatrix();
        return this;
    }

    public setScalingByAxis(value: number, axis: AXIS_ENUM) {
        this.scaling[axis] = value;
        this.calculateMatrix();
        return this;
    }

    public setModelMatrix(matrix: mat4) {
        this.replacedModelMatrix = matrix;

        this.calculateMatrix();
        return this;
    }

    public setScaling(scaling: vec3) {
        this.scaling = scaling;
        this.calculateMatrix();

        return this;
    }

    public getPosition() {
        return this.position;
    }

    public getRotation() {
        return this.rotation;
    }

    public getScaling() {
        return this.scaling;
    }

    public getLocalModelMatrix() {
        return this.resultModelMatrix;
    }

    public getGlobalModelMatrix(): mat4 {
        if (!this.parentTransform) {
            return this.getLocalModelMatrix();
        }

        return mat4.mul(
            mat4.create(),
            this.parentTransform.getGlobalModelMatrix(),
            this.getLocalModelMatrix()
        );
    }

    public getParentGlobalModelMatrix() {
        return this.parentTransform?.getGlobalModelMatrix() ?? mat4.create();
    }

    public getLocalNormalMatrix() {
        return this.normalMatrix;
    }

    public getGlobalNormalMatrix(): mat3 {
        if (!this.parentTransform) {
            return this.getLocalNormalMatrix();
        }

        return mat3.mul(
            mat3.create(),
            this.parentTransform.getGlobalNormalMatrix(),
            this.getLocalNormalMatrix()
        );
    }

    public subscribe(cb: OnTransformSubscriberCb) {
        this.onTransformSubscribers.push(cb);

        return unsubArr(this.onTransformSubscribers, (cur) => cur === cb);
    }

    private calculateMatrix() {
        mat4.fromScaling(this.scalingMatrix, this.scaling);
        mat4.fromTranslation(this.translation, this.position);

        mat4.mul(this.transformMatrix, this.translation, this.scalingMatrix);
        mat4.mul(
            this.currentModelMatrix,
            this.transformMatrix,
            this.rotation.getRotation()
        );
        mat4.multiply(
            this.resultModelMatrix,
            this.replacedModelMatrix,
            this.currentModelMatrix
        );
        mat3.normalFromMat4(this.normalMatrix, this.resultModelMatrix);

        this.publish();
    }

    private publish() {
        this.onTransformSubscribers.forEach((cb) => {
            cb(this);
        });
    }
}
