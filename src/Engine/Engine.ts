import { vec3 } from "gl-matrix";
import { Canvas } from "./EngineInterface/Canvas/Canvas";
import { EngineInterface } from "./EngineInterface/EngineInterface";
import { ObjectSelector } from "./ObjectSelector";
import { Rays } from "./Rays";
import { Render } from "./Render";
import { Scene } from "./Scene";

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

    private static isMouseDown = false;

    public static Init() {
        Engine.objectSelector = new ObjectSelector();

        Engine.engineInterface = new EngineInterface(document.body);

        Engine.canvas = Engine.engineInterface.getRenderWindow();

        Engine.canvas.onNormalize((width, height) => {
            Engine.scene?.getCamera().createProjection(width / height);
        });

        Engine.render = new Render(Engine.canvas.getRenderView());
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

    private static subscribe() {
        const renderView = Engine.canvas.getRenderView();

        renderView.addEventListener("mousedown", (e) => {
            const isLeftClick = e.button === 0;

            if (isLeftClick && Engine.scene) {
                Engine.isMouseDown = true;

                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    Engine.canvas.getRenderView(),
                    Engine.scene.getCamera()
                );

                Engine.objectSelector.select(ray, Engine.scene.getObjects());
            }
        });

        renderView.addEventListener("mousemove", (e) => {
            if (!Engine.isMouseDown || !Engine.scene) return;

            const selected = Engine.objectSelector.getSelected();

            if (selected?.object) {
                const camera = Engine.scene.getCamera();

                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    Engine.canvas.getRenderView(),
                    camera
                );

                const t = vec3.distance(
                    camera.getPosition(),
                    selected.object.getPosition()
                );

                const point = vec3.create();

                vec3.scaleAndAdd(
                    point,
                    camera.getPosition(),
                    ray.getDirection(),
                    t
                );
                selected.object.setPosition(point);
            }
        });

        renderView.addEventListener("mouseup", (e) => {
            Engine.objectSelector.clear();
            Engine.isMouseDown = false;
        });

        renderView.addEventListener("wheel", (e) => {
            const selected = Engine.objectSelector.getSelected();

            if (selected?.object && Engine.scene) {
                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    Engine.canvas.getRenderView(),
                    Engine.scene.getCamera()
                );

                const deltaY = e.deltaY * -0.01;
                const point = vec3.create();

                vec3.scaleAndAdd(
                    point,
                    selected.object.getPosition(),
                    ray.getDirection(),
                    deltaY
                );
                selected.object.setPosition(point);
            }
        });
    }
}
