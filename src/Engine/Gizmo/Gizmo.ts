import { vec3 } from "gl-matrix";
import { Engine } from "engine/Engine";
import { ObjectSelector } from "engine/ObjectSelector";
import { Rays } from "engine/Rays";
import { Ray } from "engine/Ray";
import { Scale } from "engine/Gizmo/Scale";
import { GizmoType } from "engine/Gizmo/GizmoType";
import { Translation } from "engine/Gizmo/Translation";
import { Rotate } from "engine/Gizmo/Rotate";
import { EngineObject } from "engine/EngineObject";
import { unsubArr } from "engine/Utils/Utils";

export enum GIZMO_TYPE_ENUM {
    TRANSLATION = "TRANSLATION",
    SCALE = "SCALE",
    ROTATE = "ROTATE",
}

type SubscriberType = (type: GIZMO_TYPE_ENUM) => void;
export class Gizmo {
    private static isMoving = false;
    private static isMouseDown = false;
    private static show = false;
    private static objectSelector: ObjectSelector;

    private static unsubTransformObject: (() => void) | null = null;

    private static currentGizmo: GizmoType;
    private static currentGizmoType = GIZMO_TYPE_ENUM.TRANSLATION;
    private static gizmoTypes: Record<GIZMO_TYPE_ENUM, GizmoType> = {
        [GIZMO_TYPE_ENUM.TRANSLATION]: new Translation(),
        [GIZMO_TYPE_ENUM.SCALE]: new Scale(),
        [GIZMO_TYPE_ENUM.ROTATE]: new Rotate(),
    };

    private static subscribersChangeTypeCb: SubscriberType[] = [];

    public static init() {
        Gizmo.objectSelector = new ObjectSelector();
        Gizmo.currentGizmo = Gizmo.gizmoTypes[Gizmo.currentGizmoType];

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

                    Gizmo.changeGizmoScaling(selectedObject);
                });
        });

        Engine.getObjectSelector().addOnChange(({ entity }) => {
            Gizmo.changeObject(entity?.object ?? null);
        });
    }

    public static getCurrentType() {
        return Gizmo.currentGizmoType;
    }

    public static subscribeType(callback: SubscriberType) {
        Gizmo.subscribersChangeTypeCb.push(callback);

        return unsubArr(
            Gizmo.subscribersChangeTypeCb,
            (cur) => cur === callback
        );
    }

    public static changeType(type: GIZMO_TYPE_ENUM) {
        const object = Engine.getObjectSelector().getSelected().entity?.object;

        Gizmo.currentGizmoType = type;
        Gizmo.currentGizmo = Gizmo.gizmoTypes[Gizmo.currentGizmoType];

        Gizmo.changeObject(object ?? null);

        Gizmo.subscribersChangeTypeCb.forEach((cb) => {
            cb(Gizmo.currentGizmoType);
        });
    }

    public static getGizmoModel() {
        return Gizmo.currentGizmo.getModel();
    }

    public static isSelectedGizmo(ray: Ray) {
        if (!Gizmo.show) return false;

        Gizmo.objectSelector.select(ray, [Gizmo.currentGizmo.getModel()]);
        const { entity } = Gizmo.objectSelector.getSelected();

        return !!entity;
    }

    public static update() {
        Gizmo.getGizmoModel().update();
    }

    public static isMovingGizmo() {
        return Gizmo.isMoving;
    }

    public static isShow() {
        return Gizmo.show;
    }

    public static getObjectSelector() {
        return Gizmo.objectSelector;
    }

    public static clear() {
        const object = Engine.getObjectSelector().getSelected().entity?.object;

        if (object) {
            Gizmo.currentGizmo.update(object);
        }

        Gizmo.isMoving = false;
        Gizmo.isMouseDown = false;
    }

    public static select(e: MouseEvent) {
        const canvas = Engine.getCanvas();

        const isLeftClick = e.button === 0;
        const scene = Engine.getScene();
        const selectedObject = Engine.getObjectSelector().getSelected().entity;

        if (!scene || !isLeftClick || !selectedObject) return;

        Gizmo.isMouseDown = true;

        const ray = Rays.RayCast(
            e.clientX,
            e.clientY,
            canvas,
            scene.getCamera()
        );

        Gizmo.objectSelector.select(ray, [Gizmo.currentGizmo.getModel()]);

        const { entity } = Gizmo.objectSelector.getSelected();

        if (!entity) return;

        Gizmo.isMoving = true;

        const gizmoModel = Gizmo.currentGizmo.getModel();

        const selectedAxis = gizmoModel.getMeshes().indexOf(entity.mesh);

        if (selectedAxis < 0) return;

        this.currentGizmo.select(selectedObject.object, ray, selectedAxis);
    }

    public static move(e: MouseEvent) {
        const renderView = Engine.getCanvas();

        const scene = Engine.getScene();
        const sceneObjectSelected =
            Engine.getObjectSelector().getSelected().entity?.object;
        const gizmoSelectedObject = Gizmo.objectSelector.getSelected().entity;

        if (
            !Gizmo.isMouseDown ||
            !scene ||
            !sceneObjectSelected ||
            !gizmoSelectedObject
        )
            return;

        const selectedAxis = Gizmo.currentGizmo
            .getModel()
            .getMeshes()
            .indexOf(gizmoSelectedObject.mesh);

        if (selectedAxis < 0) {
            return;
        }

        const camera = scene.getCamera();
        const ray = Rays.RayCast(e.clientX, e.clientY, renderView, camera);

        this.currentGizmo.move(sceneObjectSelected, ray, selectedAxis);

        Gizmo.changeGizmoScaling(sceneObjectSelected);
    }

    private static changeObject(object: EngineObject | null) {
        this.unsubTransformObject?.();

        if (!object) {
            Gizmo.show = false;

            return;
        }

        this.unsubTransformObject = object
            .getTransform()
            .subscribe((newTransform) => {
                Gizmo.currentGizmo
                    .getModel()
                    .getTransform()
                    .setPosition(newTransform.getPosition());

                Gizmo.changeGizmoScaling(object);
            });

        const objectPos = object.getTransform().getPosition();
        const gizmoTransform = Gizmo.currentGizmo.getModel().getTransform();
        gizmoTransform.setPosition(objectPos);

        Gizmo.changeGizmoScaling(object);
        Gizmo.currentGizmo.update(object);

        Gizmo.show = true;
    }

    private static changeGizmoScaling(object: EngineObject) {
        const camera = Engine.getScene()?.getCamera();

        if (!camera) {
            Gizmo.show = false;
            return;
        }

        const cameraPos = camera.getTransform().getPosition();

        const distance =
            vec3.distance(object.getTransform().getPosition(), cameraPos) * 0.1;
        const newScaling = vec3.create();

        const initScale = this.currentGizmo.getInitScale();
        vec3.scale(newScaling, initScale, distance);

        Gizmo.currentGizmo.getModel().getTransform().setScaling(newScaling);
    }
}
