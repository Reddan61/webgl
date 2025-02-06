import { vec3, vec4 } from "gl-matrix";
import { Object } from "engine/Object";
import { Engine } from "engine/Engine";
import { ObjectSelector } from "engine/ObjectSelector";
import { Rays } from "engine/Rays";
import { Mesh } from "engine/Mesh";
import { AXIS_ENUM } from "engine/Utils/types";
import { axisIntersection } from "engine/Utils/axisIntersection";
import { createArrow } from "engine/Utils/CreateObjects/createArrow";

export class Gizmo {
    private static show = false;
    private static movingModel: Object;
    private static objectSelector: ObjectSelector;
    private static isMouseDown = false;
    private static offset = vec3.create();
    private static initGizmoScaling = vec3.create();

    public static init() {
        const alpha = 1;
        this.objectSelector = new ObjectSelector();
        const arrowZMesh = createArrow(vec4.fromValues(0, 0, 1, alpha));
        arrowZMesh
            .getTransform()
            .setScaling([1, 1, 1.5])
            .setPosition([0, 0, 0.05]);
        const arrowYMesh = createArrow(vec4.fromValues(0, 1, 0, alpha));
        arrowYMesh
            .getTransform()
            .setScaling([1, 1.5, 1])
            .rotate(-90, 0)
            .setPosition([0, 0.05, 0]);
        const arrowXMesh = createArrow(vec4.fromValues(1, 0, 0, alpha));
        arrowXMesh
            .getTransform()
            .setScaling([1.5, 1, 1])
            .rotate(0, 90)
            .setPosition([0.05, 0, 0]);

        const meshes = [] as Mesh[];
        meshes[AXIS_ENUM.X] = arrowXMesh;
        meshes[AXIS_ENUM.Y] = arrowYMesh;
        meshes[AXIS_ENUM.Z] = arrowZMesh;

        this.movingModel = new Object(meshes, [0, 0, 0], [1, 1, 1]);
        this.movingModel.setSingleFace(true);
        this.subscribe();

        this.initGizmoScaling = this.movingModel.getTransform().getScaling();

        Engine.onSetScene((scene) => {
            scene
                ?.getCamera()
                .getTransform()
                .subscribe(() => {
                    const selectedObject =
                        Engine.getObjectSelector().getSelected().entity?.object;

                    if (!selectedObject) {
                        return;
                    }

                    this.changeGizmoScaling(selectedObject);
                });
        });

        Engine.getObjectSelector().addOnChange(({ entity }) => {
            if (!entity) {
                this.show = false;

                return;
            }

            const objectPos = entity.object.getTransform().getPosition();
            const gizmoTransform = this.movingModel.getTransform();
            gizmoTransform.setPosition(objectPos);
            this.changeGizmoScaling(entity.object);

            this.show = true;
        });
    }

    public static getGizmoModel() {
        return this.movingModel;
    }

    public static isShow() {
        return this.show;
    }

    public static getObjectSelector() {
        return this.objectSelector;
    }

    private static changeGizmoScaling(object: Object) {
        const camera = Engine.getScene()?.getCamera();

        if (!camera) {
            this.show = false;
            return;
        }

        const cameraPos = camera.getTransform().getPosition();

        const distance =
            vec3.distance(object.getTransform().getPosition(), cameraPos) * 0.1;
        const newScaling = vec3.create();
        vec3.scale(newScaling, this.initGizmoScaling, distance);

        this.movingModel.getTransform().setScaling(newScaling);
    }

    private static subscribe() {
        const renderView = Engine.getCanvas().getRenderView();

        renderView.addEventListener("mousedown", (e) => {
            const isLeftClick = e.button === 0;
            const scene = Engine.getScene();
            const objectSelector = Engine.getObjectSelector();

            if (!scene || !isLeftClick) return;

            if (!objectSelector.getSelected().entity) {
                return;
            }

            this.isMouseDown = true;

            const ray = Rays.RayCast(
                e.clientX,
                e.clientY,
                renderView,
                scene.getCamera()
            );

            this.objectSelector.select(ray, [this.movingModel]);

            const { entity } = this.objectSelector.getSelected();

            if (entity) {
                const { point } = entity.hit;

                vec3.sub(
                    this.offset,
                    this.movingModel.getTransform().getPosition(),
                    point
                );
            }
        });

        renderView.addEventListener("mousemove", (e) => {
            const scene = Engine.getScene();
            const sceneObjectSelected =
                Engine.getObjectSelector().getSelected().entity?.object;
            const selected = this.objectSelector.getSelected().entity;

            if (
                !this.isMouseDown ||
                !scene ||
                !sceneObjectSelected ||
                !selected
            )
                return;

            const selectedAxis = this.movingModel
                .getMeshes()
                .indexOf(selected.mesh);

            if (selectedAxis < 0) {
                return;
            }

            const camera = scene.getCamera();
            const ray = Rays.RayCast(e.clientX, e.clientY, renderView, camera);
            const objectPos = selected.object.getTransform().getPosition();
            const normalAxis = vec3.create();
            normalAxis[selectedAxis] = 1;

            const intersection = axisIntersection(ray, objectPos, selectedAxis);

            if (intersection === null) return;

            const nextPoint = vec3.create();
            vec3.add(nextPoint, intersection, this.offset);

            const sceneObjectTransform = sceneObjectSelected.getTransform();

            sceneObjectTransform.setPositionByAxis(
                nextPoint[selectedAxis],
                selectedAxis
            );

            this.movingModel
                .getTransform()
                .setPosition(sceneObjectTransform.getPosition());

            this.changeGizmoScaling(sceneObjectSelected);
        });

        document.addEventListener("mouseup", () => {
            this.objectSelector.clear();
            this.isMouseDown = false;
        });
    }
}
