import { glMatrix, mat4, vec3 } from "gl-matrix";
import { Rotation } from "../Rotation";

export class Camera {
    constructor(position: vec3) {
        this.rotation = new Rotation();
        this.position = position;
        this.view = mat4.create();
        
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
    private view: mat4 = null;
    private rotation: Rotation = null;
    private keys: Record<KeyboardEvent['code'], boolean> = {};
    private isMouseDown = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    private calculateView() {
        const target = vec3.create();
		vec3.add(target, this.position, this.rotation.getFront());

		mat4.lookAt(this.view, this.position,  target, this.rotation.getUp());
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

            this.rotation.rotate(
                this.rotation.getXAngle() + deltaY,
                this.rotation.getYAngle() + deltaX,
            );
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
            vec3.scale(temp, this.rotation.getRight(), newSpeed);

            vec3.subtract(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["KeyD"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.rotation.getRight(), newSpeed);

            vec3.add(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["KeyW"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.rotation.getFront(), newSpeed);

            vec3.add(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["KeyS"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.rotation.getFront(), newSpeed);

            vec3.subtract(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["Space"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.rotation.getUp(), newSpeed);

            vec3.add(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["ShiftLeft"]) {
            const temp = vec3.create();
            vec3.scale(temp, this.rotation.getUp(), newSpeed);

            vec3.subtract(this.position, this.position, temp);

            isChanged = true;
        }

        if (this.keys["ArrowLeft"]) {
            this.rotation.rotate(null, this.rotation.getYAngle() + newSens);

            isChanged = true;
        }

        if (this.keys["ArrowRight"]) {
            this.rotation.rotate(null, this.rotation.getYAngle() - newSens);

            isChanged = true;
        }

        if (this.keys["ArrowUp"]) {
            this.rotation.rotate(this.rotation.getXAngle() + newSens, null);

            isChanged = true;
        }

        if (this.keys["ArrowDown"]) {
            this.rotation.rotate(this.rotation.getXAngle() - newSens, null);

            isChanged = true;
        }

        if (isChanged) {
            this.calculateView();
        }
    }
}