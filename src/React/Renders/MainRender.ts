import { Scene } from "engine/Scene";
import { Render } from "engine/Render/Render";
import { ShadowMapProgram } from "ui/Programs/ShadowMapProgram/ShadowMapProgram";
import { ShadowAtlasProgram } from "ui/Programs/ShadowAtlasProgram/ShadowAtlasProgram";
import { TriangleProgram } from "ui/Programs/TriangleProgram/TriangleProgram";
import { GizmoProgram } from "engine/Render/DefaultRender/DefaultPrograms/GizmoProgram/GizmoProgram";
// import { TextureShowProgram } from "engine/Render/DefaultRender/DefaultPrograms/TextureShowProgram/TextureShowProgram";

export class MainRender extends Render {
    private gizmoProgram: GizmoProgram;
    private triangleProgram: TriangleProgram;
    private shadowMapProgram: ShadowMapProgram;
    private shadowAtlasProgram: ShadowAtlasProgram;

    // private textureShowProgram: TextureShowProgram;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.gizmoProgram = new GizmoProgram(this.webgl);
        this.triangleProgram = new TriangleProgram(this.webgl);
        this.shadowMapProgram = new ShadowMapProgram(this.webgl);
        this.shadowAtlasProgram = new ShadowAtlasProgram(this.webgl);
        // this.textureShowProgram = new TextureShowProgram(this.webgl);
    }

    public getContext() {
        return this.webgl;
    }

    public draw(scene: Scene) {
        // const startTime = performance.now();
        super.clear();

        this.shadowMapProgram.draw(scene);
        this.shadowAtlasProgram.draw(scene);

        // this.textureShowProgram.draw({
        //     width: this.canvas.width,
        //     height: this.canvas.height,
        //     texture: this.shadowAtlasProgram.getAtlasTexture().getTexture(),
        // });
        this.triangleProgram.draw(
            this.canvas.width,
            this.canvas.height,
            scene,
            this.shadowAtlasProgram,
            this.shadowMapProgram
        );

        this.gizmoProgram.draw(scene);

        // const endTime = performance.now();
        // const frameTime = endTime - startTime;

        // console.log(`${frameTime} ms`);
    }
}
