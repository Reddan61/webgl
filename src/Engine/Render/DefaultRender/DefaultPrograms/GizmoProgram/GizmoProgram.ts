import { Camera } from "engine/Camera";
import { fragment } from "./shaders/fragment";
import { vertex } from "./shaders/vertex";
import { ArrayBuffer } from "engine/Programs/Buffer/ArrayBuffer";
import { ElementBuffer } from "engine/Programs/Buffer/ElementBuffer";
import { Program } from "engine/Programs/Program";
import { Uniform4fv } from "engine/Programs/Uniform/Uniform4fv";
import { UniformMatrix4fv } from "engine/Programs/Uniform/UniformMatrix4fv";
import { Scene } from "engine/Scene";
import { mat4, vec4 } from "gl-matrix";
import { Gizmo } from "engine/Gizmo/Gizmo";

export class GizmoProgram extends Program {
    private vertexBuffer: ArrayBuffer;
    private indicesBuffer: ElementBuffer;

    private transformationMatUniform: UniformMatrix4fv;
    private projectionMatUniform: UniformMatrix4fv;
    private viewMatUniform: UniformMatrix4fv;

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
        const gizmoModel = Gizmo.getGizmoModel();

        if (!Gizmo.isShow()) {
            return;
        }

        this.useProgram();
        this.bind();

        const camera = scene.getCamera();
        this.updateView(camera.getView());

        gizmoModel.getMeshes().forEach((mesh) => {
            mesh.getPrimitives().forEach((prim) => {
                const indices = prim.getIndices();

                this.setVariables(
                    prim.getVertices(),
                    indices,
                    mesh.getTransform().getGlobalModelMatrix(),
                    prim.getMaterial().getColor(),
                    camera
                );

                this.webgl.drawElements(
                    this.webgl.TRIANGLES,
                    indices.length,
                    this.webgl.UNSIGNED_SHORT,
                    0
                );
            });
        });
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
        this.indicesBuffer = new ElementBuffer(this.webgl);

        this.setAttributes();
    }

    private matrixInit() {
        this.viewMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "view"
        );
        this.transformationMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "transformation"
        );

        this.projectionMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "projection"
        );
        this.colorUniform = new Uniform4fv(this.webgl, this.program, "color");
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
    }

    private setVariables(
        vertices: Float32Array,
        indices: Uint16Array,
        modelMatrix: mat4,
        color: vec4,
        camera: Camera
    ) {
        this.viewMatUniform.setData(camera.getView());
        this.projectionMatUniform.setData(camera.getProjection());

        this.vertexBuffer.setBufferData(vertices);
        this.indicesBuffer.setBufferData(indices);

        this.transformationMatUniform.setData(modelMatrix);
        this.colorUniform.setData(color);
    }
}
