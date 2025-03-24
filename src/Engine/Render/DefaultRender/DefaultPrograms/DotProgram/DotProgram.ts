import { mat4, vec4 } from "gl-matrix";
import { Camera } from "engine/Camera";
import { ArrayBuffer } from "engine/Programs/Buffer/ArrayBuffer";
import { Program } from "engine/Programs/Program";
import { Uniform1f } from "engine/Programs/Uniform/Uniform1f";
import { Uniform4fv } from "engine/Programs/Uniform/Uniform4fv";
import { UniformMatrix4fv } from "engine/Programs/Uniform/UniformMatrix4fv";
import { Scene } from "engine/Scene";
import { Engine } from "engine/Engine";
import { vertex } from "./shaders/vertex";
import { fragment } from "./shaders/fragment";

export class DotProgram extends Program {
    private vertexBuffer: ArrayBuffer;

    private projectionMatUniform: UniformMatrix4fv;
    private viewMatUniform: UniformMatrix4fv;
    private pointSizeUniform: Uniform1f;

    private colorUniform: Uniform4fv;

    constructor(webgl: WebGL2RenderingContext) {
        super(webgl);
        this.Init(vertex, fragment);
        super.useProgram();
        this.initBuffers();
        this.matrixInit();
    }

    public useProgram() {
        super.useProgram();
        this.setAttributes();
    }

    public draw(scene: Scene) {
        const selected = Engine.getObjectSelector().getSelected().entity;

        if (!selected) {
            return;
        }

        this.useProgram();
        this.bind();

        const camera = scene.getCamera();
        this.updateView(camera.getView());

        const point = selected.hit.point;

        this.setVariables(new Float32Array(point), [1, 1, 1, 1], 5, camera);
        this.webgl.drawArrays(this.webgl.POINTS, 0, 1);
    }

    private bind() {
        this.webgl.disable(this.webgl.CULL_FACE);
        this.webgl.clear(this.webgl.DEPTH_BUFFER_BIT);
        this.webgl.depthFunc(this.webgl.LEQUAL);
    }

    private updateView(view: mat4) {
        this.viewMatUniform.setData(view);
    }

    private initBuffers() {
        this.vertexBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "vertexPosition",
            3,
            this.webgl.FLOAT
        );

        this.setAttributes();
    }

    private matrixInit() {
        this.viewMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "view"
        );

        this.projectionMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "projection"
        );
        this.colorUniform = new Uniform4fv(this.webgl, this.program, "color");
        this.pointSizeUniform = new Uniform1f(
            this.webgl,
            this.program,
            "pointSize"
        );
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
    }

    private setVariables(
        vertices: Float32Array,
        color: vec4,
        pointSize: number,
        camera: Camera
    ) {
        this.pointSizeUniform.setData(pointSize);
        this.viewMatUniform.setData(camera.getView());
        this.projectionMatUniform.setData(camera.getProjection());

        this.vertexBuffer.setBufferData(vertices);

        this.colorUniform.setData(color);
    }
}
