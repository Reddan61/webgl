import { glMatrix, mat4, quat, vec3 } from "gl-matrix";

export class Rotation {
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

    public getRotation() {
        return this.rotation;
    }
    // x - pitch, y - yaw
    public rotate(xAngle: number | null, yAngle: number | null) {
        if (xAngle !== null) {
            this.xRotate(xAngle);
        }

        if (yAngle !== null) {
            this.yRotate(yAngle);
        }

        this.calculateRotation();
    }

    private xRotate(angle: number) {
        this.xAngle = angle;
    }

    private yRotate(angle: number) {
        this.yAngle = angle;
    }

    private calculateRotation() {
        const q = quat.create();
        quat.fromEuler(q, this.xAngle, this.yAngle, 0);
        mat4.fromQuat(this.rotation, q);

        vec3.transformMat4(this.front, [0, 0, -1], this.rotation);
        vec3.normalize(this.front, this.front);

        vec3.transformMat4(this.up, [0, 1, 0], this.rotation);
        vec3.normalize(this.up, this.up);

        vec3.cross(this.right, this.front, this.up);
        vec3.normalize(this.right, this.right);
    }

    private up = vec3.create();
    private right = vec3.create();
    private front = vec3.create();

    private xAngle = 0;
    private yAngle = 0;

    private xRotation = mat4.create();
    private yRotation = mat4.create();
    private rotation = mat4.create();
}
