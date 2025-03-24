import { Scene } from "engine/Scene";

export abstract class Render {
    protected canvas: HTMLCanvasElement;
    protected webgl: WebGL2RenderingContext;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        const gl = canvas.getContext("webgl2");

        if (!gl) {
            throw new Error("Unable to init webgl2");
        }

        this.webgl = gl;

        this.clear();
        this.depth();
        this.blend();
        this.cullFace();
    }

    public getContext() {
        return this.webgl;
    }

    public draw(scene: Scene) {
        this.clear();
    }

    protected clear() {
        this.webgl.clearColor(0, 0, 0, 1);
        this.webgl.clear(
            this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );
    }

    protected depth() {
        this.webgl.enable(this.webgl.DEPTH_TEST);
        this.webgl.depthFunc(this.webgl.LESS);
    }

    protected blend() {
        this.webgl.enable(this.webgl.BLEND);
        this.webgl.blendFunc(
            this.webgl.SRC_ALPHA,
            this.webgl.ONE_MINUS_SRC_ALPHA
        );
    }

    protected cullFace() {
        this.webgl.enable(this.webgl.CULL_FACE);
        this.webgl.frontFace(this.webgl.CCW);
        this.webgl.cullFace(this.webgl.BACK);
    }
}
