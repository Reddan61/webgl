import { TriangleProgram } from "./Programs/TriangleProgram";
import { LineProgram } from "./Programs/LineProgram";
import { Scene } from "./Scene";
import { ShadowMapProgram } from "./Programs/ShadowMapProgram";
import { ShadowAtlasProgram } from "./Programs/ShadowAtlasProgram";
import { TextureShowProgram } from "./Programs/TextureShowProgram";
import {
    ENGINE_CONFIG_KEYS,
    getEngineConfig,
} from "./ENGINE_CONFIG/ENGINE_CONFIG";
import { DotProgram } from "engine/Programs/DotProgram/DotProgram";
import { GizmoProgram } from "engine/Programs/GizmoProgram/GizmoProgram";

export class Render {
    private canvas: HTMLCanvasElement;
    private webgl: WebGL2RenderingContext;
    private triangleProgram: TriangleProgram;
    private lineProgram: LineProgram;
    private shadowMapProgram: ShadowMapProgram;
    private shadowAtlasProgram: ShadowAtlasProgram;
    private textureShowProgram: TextureShowProgram;
    private gizmoProgram: GizmoProgram;
    private dotProgram: DotProgram;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        const gl = canvas.getContext("webgl2");

        if (!gl) {
            throw new Error("Unable to init webgl2");
        }

        this.webgl = gl;

        this.triangleProgram = new TriangleProgram(this.webgl);
        this.lineProgram = new LineProgram(this.webgl);
        this.shadowMapProgram = new ShadowMapProgram(this.webgl);
        this.shadowAtlasProgram = new ShadowAtlasProgram(this.webgl);
        this.textureShowProgram = new TextureShowProgram(this.webgl);
        this.gizmoProgram = new GizmoProgram(this.webgl);
        this.dotProgram = new DotProgram(this.webgl);

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
    }

    public getContext() {
        return this.webgl;
    }

    public draw(scene: Scene) {
        this.clear();

        this.shadowMapProgram.draw(scene);
        this.shadowAtlasProgram.draw(scene);

        if (getEngineConfig(ENGINE_CONFIG_KEYS.SHOW_POINT_LIGHT_SHADOW_MAP)) {
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
                scene,
                this.shadowAtlasProgram,
                this.shadowMapProgram
            );
        }

        if (getEngineConfig(ENGINE_CONFIG_KEYS.SHOW_AABB)) {
            this.lineProgram.draw(scene);
        }

        this.gizmoProgram.draw(scene);

        if (getEngineConfig(ENGINE_CONFIG_KEYS.SHOW_RAY_CAST_HIT_POINT)) {
            this.dotProgram.draw(scene);
        }
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
}
