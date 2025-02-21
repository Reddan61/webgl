import { CustomMath } from "engine/Utils/Math";
import { AXIS_ENUM } from "engine/Utils/types";
import { glMatrix, mat4, quat, vec3 } from "gl-matrix";

type OnChangeCbType = () => void;

export class Rotation {
    private up = vec3.create();
    private right = vec3.create();
    private front = vec3.create();

    private xAngle = 0;
    private yAngle = 0;
    private zAngle = 0;

    private rotation = mat4.create();

    private onChangeSubscribersCb: OnChangeCbType[] = [];

    constructor() {
        const front = vec3.create();
        front[0] = 0;
        front[1] = 0;
        front[2] = -1;

        const right = vec3.create();
        right[0] = 1;
        right[1] = 0;
        right[2] = 0;

        const up = vec3.create();
        up[0] = 0;
        up[1] = 1;
        up[2] = 0;

        this.front = front;
        this.right = right;
        this.up = up;
    }

    public addOnChange(cb: OnChangeCbType) {
        this.onChangeSubscribersCb.push(cb);
    }

    private publish() {
        this.onChangeSubscribersCb.forEach((cb) => {
            cb();
        });
    }

    public setRotation(rotation: mat4) {
        this.rotation = rotation;
        this.updateEulerAngles();

        this.publish();
    }

    public getUp() {
        return this.up;
    }

    public getFront() {
        return this.front;
    }

    public getRight() {
        return this.right;
    }

    public getXAngle() {
        return this.xAngle;
    }

    public getYAngle() {
        return this.yAngle;
    }

    public getZAngle() {
        return this.zAngle;
    }

    public getRotation() {
        return this.rotation;
    }

    public rotate(
        pitchAngle?: number | null,
        yawAngle?: number | null,
        rollAngle?: number | null
    ) {
        if (pitchAngle !== null && pitchAngle !== undefined) {
            this.xRotate(pitchAngle);
        }

        if (yawAngle !== null && yawAngle !== undefined) {
            this.yRotate(yawAngle);
        }

        if (rollAngle !== null && rollAngle !== undefined) {
            this.zRotate(rollAngle);
        }

        this.calculateLocalRotation();
    }

    public rotateAroundAxis(axis: AXIS_ENUM, angle: number) {
        const dirVector = vec3.create();
        dirVector[axis] = 1;

        // current local rotation matrix
        const localMatrix = mat4.clone(this.rotation);
        mat4.identity(this.rotation);

        const q = quat.create();
        quat.setAxisAngle(q, dirVector, glMatrix.toRadian(angle));

        // rotate by global axis
        const rotationMatrix = mat4.fromQuat(mat4.create(), q);
        mat4.multiply(this.rotation, this.rotation, rotationMatrix);

        // apply prev local rotation
        mat4.multiply(this.rotation, this.rotation, localMatrix);

        this.calculateVectors();
        this.updateEulerAngles();

        this.publish();
    }

    private updateEulerAngles() {
        const matrix = this.rotation;

        const yAngleRad = Math.atan2(matrix[8], matrix[10]);
        const xAngleRad = Math.atan2(
            -matrix[9],
            Math.sqrt(matrix[0] * matrix[0] + matrix[4] * matrix[4])
        );
        const zAngleRad = Math.atan2(matrix[4], matrix[0]);

        this.xAngle = CustomMath.radToDeg(xAngleRad);
        this.yAngle = CustomMath.radToDeg(yAngleRad);
        this.zAngle = CustomMath.radToDeg(zAngleRad);
    }

    private xRotate(angle: number) {
        this.xAngle = angle;
    }

    private yRotate(angle: number) {
        this.yAngle = angle;
    }

    private zRotate(angle: number) {
        this.zAngle = angle;
    }

    private calculateLocalRotation() {
        const q = quat.create();
        quat.fromEuler(q, this.xAngle, this.yAngle, this.zAngle);
        mat4.fromQuat(this.rotation, q);

        this.calculateVectors();
        this.publish();
    }

    private calculateVectors() {
        vec3.transformMat4(this.front, [0, 0, -1], this.rotation);
        vec3.normalize(this.front, this.front);

        vec3.transformMat4(this.up, [0, 1, 0], this.rotation);
        vec3.normalize(this.up, this.up);

        vec3.cross(this.right, this.front, this.up);
        vec3.normalize(this.right, this.right);
    }
}
