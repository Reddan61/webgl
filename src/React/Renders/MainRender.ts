import { Scene } from "engine/Scene";
import { Render } from "engine/Render/Render";
import { ShadowMapProgram } from "ui/Programs/ShadowMapProgram/ShadowMapProgram";
import { ShadowAtlasProgram } from "ui/Programs/ShadowAtlasProgram/ShadowAtlasProgram";
import { TriangleProgram } from "ui/Programs/TriangleProgram/TriangleProgram";

export class MainRender extends Render {
    private triangleProgram: TriangleProgram;
    private shadowMapProgram: ShadowMapProgram;
    private shadowAtlasProgram: ShadowAtlasProgram;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.triangleProgram = new TriangleProgram(this.webgl);
        this.shadowMapProgram = new ShadowMapProgram(this.webgl);
        this.shadowAtlasProgram = new ShadowAtlasProgram(this.webgl);
    }

    public getContext() {
        return this.webgl;
    }

    public draw(scene: Scene) {
        super.clear();

        this.shadowMapProgram.draw(scene);
        this.shadowAtlasProgram.draw(scene);

        this.triangleProgram.draw(
            this.canvas.width,
            this.canvas.height,
            scene,
            this.shadowAtlasProgram,
            this.shadowMapProgram
        );
    }
}
