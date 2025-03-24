import { glMatrix, mat4, vec3 } from "gl-matrix";
import { Rotation } from "../Rotation";
import { Transform } from "engine/Transform/Transform";
import { AXIS_ENUM } from "engine/Utils/types";
import { Engine } from "engine/Engine";

export class Camera {
    private speed = 10.0;
    private arrowSens = 30.0;
    private mouseSens = 0.1;
    private transform: Transform;
    private farPlane = 100000;
    private view: mat4;
    private projection: mat4;
    // private keys: Record<KeyboardEvent["code"], boolean> = {};
    private isMouseDown = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    constructor(position: vec3) {
        this.view = mat4.create();
        this.transform = new Transform();
        this.transform.setPosition(position);

        this.calculateView();

        this.subscribeEvents();
    }

    public createProjection(aspect: number) {
        this.projection = mat4.create();

        mat4.perspective(
            this.projection,
            glMatrix.toRadian(45),
            aspect,
            0.1,
            this.farPlane
        );
    }

    public getFarPlane() {
        return this.farPlane;
    }

    public getView() {
        return this.view;
    }

    public getTransform() {
        return this.transform;
    }

    public getProjection() {
        return this.projection;
    }

    public update(delta: number) {
        this.manageKeys(delta);
    }

    private calculateView() {
        const position = this.transform.getPosition();
        const rotation = this.transform.getRotation();

        const target = vec3.create();
        vec3.add(target, position, rotation.getFront());

        mat4.lookAt(this.view, position, target, rotation.getUp());
    }

    private subscribeEvents() {
        window.oncontextmenu = () => false;

        // document.addEventListener("keydown", (e) => {
        //     this.keys[e.code] = true;
        // });

        // document.addEventListener("keyup", (e) => {
        //     this.keys[e.code] = false;
        // });

        document.addEventListener("mousedown", (e) => {
            const isRightClick = e.button === 2;

            if (isRightClick) {
                e.preventDefault();
                this.isMouseDown = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });
        document.addEventListener("mouseup", (e) => {
            this.isMouseDown = false;
        });

        document.addEventListener("mousemove", (e) => {
            if (!this.isMouseDown) return;

            const deltaX = (e.clientX - this.lastMouseX) * this.mouseSens;
            const deltaY = (e.clientY - this.lastMouseY) * this.mouseSens;

            const rotation = this.transform.getRotation();

            rotation.rotate(
                rotation.getEulerAngleByAxis(AXIS_ENUM.X) + deltaY,
                rotation.getEulerAngleByAxis(AXIS_ENUM.Y) + deltaX
            );
            this.calculateView();

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
    }

    private manageKeys(delta: number) {
        let isChanged = false;
        const newSpeed = this.speed * delta;
        const newSens = this.arrowSens * delta;
        const transform = this.transform;
        const rotation = transform.getRotation();

        const controls = Engine.getControls();

        if (controls.getKey("KeyA")) {
            const temp = vec3.create();
            vec3.scale(temp, rotation.getRight(), newSpeed);

            transform.setPosition(
                vec3.subtract(vec3.create(), transform.getPosition(), temp)
            );

            isChanged = true;
        }

        if (controls.getKey("KeyD")) {
            const temp = vec3.create();
            vec3.scale(temp, rotation.getRight(), newSpeed);

            transform.setPosition(
                vec3.add(vec3.create(), transform.getPosition(), temp)
            );

            isChanged = true;
        }

        if (controls.getKey("KeyW")) {
            const temp = vec3.create();
            vec3.scale(temp, rotation.getFront(), newSpeed);

            transform.setPosition(
                vec3.add(vec3.create(), transform.getPosition(), temp)
            );

            isChanged = true;
        }

        if (controls.getKey("KeyS")) {
            const temp = vec3.create();
            vec3.scale(temp, rotation.getFront(), newSpeed);

            transform.setPosition(
                vec3.subtract(vec3.create(), transform.getPosition(), temp)
            );

            isChanged = true;
        }

        if (controls.getKey("Space")) {
            const temp = vec3.create();
            vec3.scale(temp, rotation.getUp(), newSpeed);

            transform.setPosition(
                vec3.add(vec3.create(), transform.getPosition(), temp)
            );

            isChanged = true;
        }

        if (controls.getKey("ShiftLeft")) {
            const temp = vec3.create();
            vec3.scale(temp, rotation.getUp(), newSpeed);

            transform.setPosition(
                vec3.subtract(vec3.create(), transform.getPosition(), temp)
            );

            isChanged = true;
        }

        if (controls.getKey("ArrowLeft")) {
            rotation.rotate(
                null,
                rotation.getEulerAngleByAxis(AXIS_ENUM.Y) + newSens
            );

            isChanged = true;
        }

        if (controls.getKey("ArrowRight")) {
            rotation.rotate(
                null,
                rotation.getEulerAngleByAxis(AXIS_ENUM.Y) - newSens
            );

            isChanged = true;
        }

        if (controls.getKey("ArrowUp")) {
            rotation.rotate(
                rotation.getEulerAngleByAxis(AXIS_ENUM.X) + newSens,
                null
            );

            isChanged = true;
        }

        if (controls.getKey("ArrowDown")) {
            rotation.rotate(
                rotation.getEulerAngleByAxis(AXIS_ENUM.X) - newSens,
                null
            );

            isChanged = true;
        }

        if (isChanged) {
            this.calculateView();
        }
    }
}
