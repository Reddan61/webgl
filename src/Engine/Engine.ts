import { vec3 } from "gl-matrix";
import { Rays } from "./Rays";
import { TriangleProgram } from "./Programs/TriangleProgram";
import { LineProgram } from "./Programs/LineProgram";
import { ObjectSelector } from "./ObjectSelector";
import { Scene } from "./Scene";
import { ShadowMapProgram } from "./Programs/ShadowMapProgram";
import { ShadowAtlasProgram } from "./Programs/ShadowAtlasProgram";
import { TextureShowProgram } from "./Programs/TextureShowProgram";

type TickFunc = (() => void) | null;

export class Engine {
    private canvas: HTMLCanvasElement;
    private webgl: WebGL2RenderingContext;
    private triangleProgram: TriangleProgram;
    private lineProgram: LineProgram;
    private shadowMapProgram: ShadowMapProgram;
    private shadowAtlasProgram: ShadowAtlasProgram;
    private textureShowProgram: TextureShowProgram;

    private currentfps = 0;
    private fpsToDraw = 0;
    private lastFpsUpdate = 0;
    private lastTime = 0;

    private scene: Scene;
    private objectSelector: ObjectSelector;

    private showAABB = false;
    private showTexture = false;

    private tickFunc: TickFunc = null;

    constructor(canvasId: string, scene: Scene) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        if (!canvas) {
            throw new Error("Canvas not found");
        }

        this.canvas = canvas;

        const gl = canvas.getContext("webgl2");

        if (!gl) {
            throw new Error("Unable to init webgl2");
        }

        this.webgl = gl;
        this.scene = scene;
        this.scene._setWebGl(this.webgl);
        this.normalizeCanvas();

        const camera = this.scene.getCamera();

        this.objectSelector = new ObjectSelector(this.canvas, camera);

        this.triangleProgram = new TriangleProgram(this.webgl);
        this.lineProgram = new LineProgram(this.webgl);
        this.shadowMapProgram = new ShadowMapProgram(this.webgl);
        this.shadowAtlasProgram = new ShadowAtlasProgram(this.webgl);
        this.textureShowProgram = new TextureShowProgram(this.webgl);

        this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
        this.webgl.clear(
            this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );
        this.webgl.enable(this.webgl.DEPTH_TEST);
        this.webgl.depthFunc(this.webgl.LESS);

        this.webgl.enable(this.webgl.BLEND);
        this.webgl.blendFunc(
            this.webgl.SRC_ALPHA,
            this.webgl.ONE_MINUS_SRC_ALPHA
        );

        this.enableCullFace();
        this.subscribe();
    }

    public update(delta: number) {
        this.scene.update(delta);
    }

    public setShowAABB(bool: boolean) {
        this.showAABB = bool;
    }

    public setShowTexture(bool: boolean) {
        this.showTexture = bool;
    }

    public getFps() {
        return this.fpsToDraw;
    }

    public setTickFunc(func: TickFunc) {
        this.tickFunc = func;
    }

    public run = () => {
        const currentTime = performance.now() / 1000;
        const delta = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.currentfps++;

        if (currentTime - this.lastFpsUpdate >= 1.0) {
            this.fpsToDraw = this.currentfps;
            this.currentfps = 0;
            this.lastFpsUpdate += 1.0;
        }

        this.update(delta);

        this.clear();

        this.shadowMapProgram.draw(this.scene);
        this.shadowAtlasProgram.draw(this.scene);

        if (this.showTexture) {
            this.textureShowProgram.draw({
                width: this.canvas.width,
                height: this.canvas.height,
                // texture: this.shadowMapProgram
                //     .getShadowMapTexture()
                //     .getTexture(),
                texture: this.shadowAtlasProgram.getAtlasTexture().getTexture(),
            });
        } else {
            this.triangleProgram.draw(
                this.canvas.width,
                this.canvas.height,
                this.scene,
                this.shadowAtlasProgram,
                this.shadowMapProgram
            );
        }

        if (this.showAABB) {
            this.lineProgram.draw(this.scene, this.objectSelector);
        }

        this.tickFunc?.();
        requestAnimationFrame(this.run);
    };

    private normalizeCanvas() {
        const parent = this.canvas.parentElement;
        const width = parent?.clientWidth ?? document.body.clientWidth;
        const height = parent?.clientHeight ?? document.body.clientHeight;

        this.setCanvasSize(width, height);
    }

    public setCanvasSize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;

        this.scene.getCamera().createProjection(width / height);
    }

    public getObjectSelector() {
        return this.objectSelector;
    }

    private clear() {
        // this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
        this.webgl.clearColor(0, 0, 0, 1);
        this.webgl.clear(
            this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );
    }

    private enableCullFace() {
        this.webgl.enable(this.webgl.CULL_FACE);
        this.webgl.frontFace(this.webgl.CCW);
        this.webgl.cullFace(this.webgl.BACK);
    }

    // private disableCullFace() {
    //     this.webgl.disable(this.webgl.CULL_FACE);
    // }

    private isMouseDown = false;

    private subscribe() {
        this.canvas.addEventListener("mousedown", (e) => {
            const isLeftClick = e.button === 0;

            if (isLeftClick) {
                this.isMouseDown = true;
                this.objectSelector.select(
                    e.clientX,
                    e.clientY,
                    this.scene.getObjects()
                );
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (!this.isMouseDown) return;

            const selected = this.objectSelector.getSelected();

            if (selected?.object) {
                const camera = this.scene.getCamera();

                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    this.canvas,
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

        this.canvas.addEventListener("mouseup", (e) => {
            this.objectSelector.clear();
            this.isMouseDown = false;
        });

        this.canvas.addEventListener("wheel", (e) => {
            const selected = this.objectSelector.getSelected();

            if (selected?.object) {
                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    this.canvas,
                    this.scene.getCamera()
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
