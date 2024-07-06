import { glMatrix, mat4, vec3 } from "gl-matrix";

export class Camera {
    constructor(position: vec3) {
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

        this.position = position;
        this.front = front;
        this.right = right;
        this.up = up;
        this.view = mat4.create();
        this.rotation = mat4.create();
        this.rotationX = mat4.create();
        this.rotationY = mat4.create();
        
        this.calculateView();

        this.subscribeEvents();
    }

    public getView() {
        return this.view;
    }

    public update(delta: number) {
        this.manageKeys(delta);
    }

    private speed = 10.0;
    private arrowSens = 30.0;
    private mouseSens = 0.1;
    private position: vec3 = null;
    private front: vec3 = null;
    private right: vec3 = null;
    private up: vec3 = null;
    private view: mat4 = null;
    private rotation: mat4 = null;
    private rotationX: mat4 = null;
    private rotationY: mat4 = null;
    private angleX = 0;
    private angleY = 0;
    private keys: Record<KeyboardEvent['code'], boolean> = {};
    private isMouseDown = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    private calculateView() {
        const target = vec3.create();
		vec3.add(target, this.position, this.front);

		mat4.lookAt(this.view, this.position,  target, this.up);
    }

    private subscribeEvents() {
        document.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        })

        document.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        })

        document.addEventListener("mousedown", (e) => {
            this.isMouseDown = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        })
        document.addEventListener("mouseup", (e) => {
            this.isMouseDown = false;
        })

        document.addEventListener("mousemove", (e) => {
            if (!this.isMouseDown) return;

            const deltaX = (e.clientX - this.lastMouseX) * this.mouseSens;
            const deltaY = (e.clientY - this.lastMouseY) * this.mouseSens;

            this.rotateY(this.angleY + deltaX);
            this.rotateX(this.angleX + deltaY);
            this.calculateView();
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        })
    }

    private manageKeys(delta: number) {
        let isChanged = false;
        const newSpeed = this.speed * delta;
        const newSens = this.arrowSens * delta;

        if (this.keys["KeyA"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.right, newSpeed);

            vec3.subtract(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["KeyD"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.right, newSpeed);

            vec3.add(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["KeyW"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.front, newSpeed);

            vec3.add(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["KeyS"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.front, newSpeed);

            vec3.subtract(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["Space"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.up, newSpeed);

            vec3.add(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["ShiftLeft"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.up, newSpeed);

            vec3.subtract(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["ArrowLeft"]) {
            this.rotateY(this.angleY + newSens);

            isChanged = true;
        }

        if (this.keys["ArrowRight"]) {
            this.rotateY(this.angleY - newSens);

            isChanged = true;
        }

        if (this.keys["ArrowUp"]) {
            this.rotateX(this.angleX + newSens);

            isChanged = true;
        }

        if (this.keys["ArrowDown"]) {
            this.rotateX(this.angleX - newSens);

            isChanged = true;
        }

        if (isChanged) {
            this.calculateView();
        }
    }

    private rotateY(angle: number) {
        this.angleY = angle;

        const radians = glMatrix.toRadian(this.angleY);

        const identity = mat4.create();
        mat4.identity(identity);
        
        mat4.rotate(this.rotationY, identity, radians, [0, 1, 0]);

        this.calculateRotation();
    }

    private rotateX(angle: number) {
        if (angle >= 89.0) {
            this.angleX = 89.0;
        } else if(angle <= -89.0) {
            this.angleX = -89.0;
        } else {
            this.angleX = angle;
        }

        const radians = glMatrix.toRadian(this.angleX);

        const identity = mat4.create();
        mat4.identity(identity);

        mat4.rotate(this.rotationX, identity, radians, [1, 0, 0]);

        this.calculateRotation();
    }

    private calculateRotation() {
        mat4.multiply(this.rotation, this.rotationY, this.rotationX);

        vec3.transformMat4(this.front, [0, 0, -1], this.rotation);
        vec3.normalize(this.front, this.front);

        vec3.transformMat4(this.up, [0, 1, 0], this.rotation);
        vec3.normalize(this.up, this.up);

        vec3.cross(this.right, this.front, this.up);
        vec3.normalize(this.right, this.right);
    }
}