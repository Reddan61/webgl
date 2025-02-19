import { Canvas } from "./EngineInterface/Canvas/Canvas";
import { EngineInterface } from "./EngineInterface/EngineInterface";
import { ObjectSelector } from "./ObjectSelector";
import { Rays } from "./Rays";
import { Render } from "./Render";
import { Scene } from "./Scene";
import { Gizmo } from "engine/Gizmo/Gizmo";

type SceneSubscriberCb = (scene: Scene | null) => void;
export class Engine {
    private static canvas: Canvas;
    private static render: Render;
    private static engineInterface: EngineInterface;
    private static scene: Scene | null;
    private static objectSelector: ObjectSelector;

    private static currentfps = 0;
    private static fpsToDraw = 0;
    private static lastFpsUpdate = 0;
    private static lastTime = 0;

    private static onSetSceneSubscribers: SceneSubscriberCb[] = [];

    public static async Init() {
        Engine.objectSelector = new ObjectSelector();

        Engine.engineInterface = new EngineInterface(document.body);

        Engine.canvas = Engine.engineInterface.getRenderWindow();

        Engine.canvas.onNormalize((width, height) => {
            Engine.scene?.getCamera().createProjection(width / height);
        });

        Engine.render = new Render(Engine.canvas.getRenderView());
        Gizmo.init();

        Engine.subscribe();
    }

    public static update(delta: number) {
        Engine.scene?.update(delta);
        Engine.engineInterface.update(Engine.fpsToDraw);
    }

    public static getScene() {
        return Engine.scene;
    }

    public static setScene(scene: Scene | null) {
        Engine.scene = scene;
        Engine.scene?._setWebGl(Engine.render.getContext());

        const { height, width } = Engine.canvas.getSize();
        Engine.scene?.getCamera().createProjection(width / height);

        Engine.onSetSceneSubscribers.forEach((cb) => {
            cb(Engine.scene);
        });
    }

    public static onSetScene(callback: SceneSubscriberCb) {
        Engine.onSetSceneSubscribers.push(callback);
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
            Engine.render.draw(Engine.scene);
        }

        requestAnimationFrame(Engine.run);
    };

    public static getObjectSelector() {
        return Engine.objectSelector;
    }

    public static getCanvas() {
        return Engine.canvas;
    }

    private static subscribe() {
        const renderView = Engine.canvas.getRenderView();

        renderView.addEventListener("mousedown", (e) => {
            Gizmo.select(e);
        });

        renderView.addEventListener("mousemove", (e) => {
            Gizmo.move(e);
        });

        renderView.addEventListener("mouseup", (e) => {
            const isLeftClick = e.button === 0;

            if (isLeftClick && Engine.scene) {
                if (Gizmo.isMovingGizmo()) {
                    Gizmo.clear();
                    return;
                }

                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    Engine.canvas.getRenderView(),
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
