import { Rotation } from "engine/Rotation";
import { AXIS_ENUM } from "engine/Utils/types";
import { mat3, mat4, vec3 } from "gl-matrix";

type OnTransformSubscriberCb = (transform: Transform) => void;

export class Transform {
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
        this.calculateMatrix();
    }

    public setPosition(position: vec3) {
        this.position = position;
        this.calculateMatrix();

        return this;
    }

    public setPositionByAxis(value: number, axis: AXIS_ENUM) {
        this.position[axis] = value;
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

    public rotate(xAngle: number, yAngle: number) {
        this.rotation.rotate(xAngle, yAngle);
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

    public getModelMatrix() {
        return this.resultModelMatrix;
    }

    public getNormalMatrix() {
        return this.normalMatrix;
    }

    public subscribe(cb: OnTransformSubscriberCb) {
        this.onTransformSubscribers.push(cb);
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
