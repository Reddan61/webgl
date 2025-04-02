import { unsubArr } from "engine/Utils/Utils";
import { Gizmo } from "engine/Gizmo/Gizmo";
import { Scene } from "engine/Scene";
import { ObjectSelector } from "engine/ObjectSelector";
import { Rays } from "engine/Rays";
import { Controls } from "engine/Controls/Controls";
import { Render } from "engine/Render/Render";
import { DefaultRender } from "engine/Render/DefaultRender/DefaultRender";

type SceneSubscriberCb = (scene: Scene | null) => void;
type OnInitSubscriberCb = () => void;
export class Engine {
    private static canvas: HTMLCanvasElement;
    private static currentRender: Render;
    private static defaultRender: DefaultRender;
    private static scene: Scene | null;
    private static objectSelector: ObjectSelector;
    private static controls: Controls;

    private static currentfps = 0;
    private static fpsToDraw = 0;
    private static lastFpsUpdate = 0;
    private static lastTime = 0;

    private static onSetSceneSubscribers: SceneSubscriberCb[] = [];
    private static onInitSubscribers: OnInitSubscriberCb[] = [];

    public static async Init(canvas: HTMLCanvasElement) {
        Engine.objectSelector = new ObjectSelector();

        Engine.canvas = canvas;
        canvas.setAttribute("tabindex", "0");

        Engine.normalizeCanvas();

        Engine.controls = new Controls(Engine.canvas);

        Engine.defaultRender = new DefaultRender(Engine.canvas);
        Engine.currentRender = Engine.defaultRender;

        Gizmo.init();

        Engine.subscribe();

        Engine.publishInitSubs();
    }

    public static update(delta: number) {
        Engine.scene?.update(delta);
        Gizmo.update();
    }

    public static getControls() {
        return Engine.controls;
    }

    public static getScene() {
        return Engine.scene;
    }

    public static setRender(render: Render | null) {
        Engine.currentRender = render ?? Engine.defaultRender;
    }

    public static setScene(scene: Scene | null) {
        Engine.scene = scene;
        Engine.scene?._setWebGl(Engine.currentRender.getContext());

        const { height, width } = Engine.canvas;
        Engine.scene?.getCamera().createProjection(width / height);

        Engine.onSetSceneSubscribers.forEach((cb) => {
            cb(Engine.scene);
        });
    }

    public static onSetScene(callback: SceneSubscriberCb) {
        Engine.onSetSceneSubscribers.push(callback);

        return () => {
            const index = Engine.onSetSceneSubscribers.findIndex(
                (el) => el === callback
            );

            if (index < 0) return;

            Engine.onSetSceneSubscribers.splice(index, 1);
        };
    }

    public static run = () => {
        const currentTime = performance.now() / 1000;
        const delta = currentTime - Engine.lastTime;
        Engine.lastTime = currentTime;
        Engine.currentfps++;

        if (currentTime - Engine.lastFpsUpdate >= 1.0) {
            Engine.fpsToDraw = Engine.currentfps;
            Engine.currentfps = 0;
            Engine.lastFpsUpdate += 1.0;
        }

        Engine.update(delta);

        if (Engine.scene) {
            Engine.currentRender.draw(Engine.scene);
        }

        requestAnimationFrame(Engine.run);
    };

    public static getObjectSelector() {
        return Engine.objectSelector;
    }

    public static getCanvas() {
        return Engine.canvas;
    }

    public static onInitSubcribe(cb: OnInitSubscriberCb) {
        Engine.onInitSubscribers.push(cb);

        return unsubArr(Engine.onInitSubscribers, (el) => el === cb);
    }

    private static publishInitSubs() {
        Engine.onInitSubscribers.forEach((cb) => cb());
    }

    private static normalizeCanvas() {
        Engine.canvas.width = Engine.canvas.clientWidth;
        Engine.canvas.height = Engine.canvas.clientHeight;

        Engine.scene
            ?.getCamera()
            .createProjection(Engine.canvas.width / Engine.canvas.height);
    }

    private static subscribe() {
        const canvas = Engine.canvas;

        window.addEventListener("resize", () => {
            Engine.normalizeCanvas();
        });

        canvas.addEventListener("mousedown", (e) => {
            Gizmo.select(e);
        });

        canvas.addEventListener("mousemove", (e) => {
            Gizmo.move(e);
        });

        canvas.addEventListener("mouseup", (e) => {
            const isLeftClick = e.button === 0;

            if (isLeftClick && Engine.scene) {
                if (Gizmo.isMovingGizmo()) {
                    Gizmo.clear();
                    return;
                }

                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    Engine.canvas,
                    Engine.scene.getCamera()
                );

                if (!Gizmo.isSelectedGizmo(ray)) {
                    Engine.objectSelector.select(
                        ray,
                        Engine.scene.getObjects()
                    );
                }
            }
        });
    }
}
