import { Scene } from "engine/Scene";
import {
    ENGINE_CONFIG_KEYS,
    getEngineConfig,
} from "engine/ENGINE_CONFIG/ENGINE_CONFIG";
import { Render } from "engine/Render/Render";
import { DotProgram } from "engine/Render/DefaultRender/DefaultPrograms/DotProgram/DotProgram";
import { LineProgram } from "engine/Render/DefaultRender/DefaultPrograms/LineProgram/LineProgram";
import { GizmoProgram } from "engine/Render/DefaultRender/DefaultPrograms/GizmoProgram/GizmoProgram";
import { TriangleProgram } from "engine/Render/DefaultRender/DefaultPrograms/TriangleProgram/TriangleProgram";

export class DefaultRender extends Render {
    private lineProgram: LineProgram;
    private gizmoProgram: GizmoProgram;
    private dotProgram: DotProgram;
    private triangleProgram: TriangleProgram;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.triangleProgram = new TriangleProgram(this.webgl);
        this.lineProgram = new LineProgram(this.webgl);
        this.gizmoProgram = new GizmoProgram(this.webgl);
        this.dotProgram = new DotProgram(this.webgl);
    }

    public getContext() {
        return this.webgl;
    }

    public draw(scene: Scene) {
        super.clear();

        this.triangleProgram.draw(this.canvas.width, this.canvas.height, scene);

        if (getEngineConfig(ENGINE_CONFIG_KEYS.SHOW_AABB)) {
            this.lineProgram.draw(scene);
        }

        this.gizmoProgram.draw(scene);

        if (getEngineConfig(ENGINE_CONFIG_KEYS.SHOW_RAY_CAST_HIT_POINT)) {
            this.dotProgram.draw(scene);
        }
    }
}
