import { mat4, vec4 } from "gl-matrix";
import { Gizmo } from "engine/Gizmo/Gizmo";
import { Program } from "engine/Programs/Program";
import { Uniform4fv } from "engine/Programs/Uniform/Uniform4fv";
import { ArrayBuffer } from "engine/Programs/Buffer/ArrayBuffer";
import { ElementBuffer } from "engine/Programs/Buffer/ElementBuffer";
import { UniformMatrix4fv } from "engine/Programs/Uniform/UniformMatrix4fv";
import { vertex } from "./shaders/vertex";
import { fragment } from "./shaders/fragment";
import { Scene } from "engine/Scene";
import { Engine } from "engine/Engine";
import { Camera } from "engine/Camera";

export type LineProgramVertices = Float32Array;
export type LineProgramIndices = Uint16Array;

export class LineProgram extends Program {
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

    public draw(scene: Scene) {
        this.useProgram();
        this.updateView(scene.getCamera().getView());
        const objectSelector = Engine.getObjectSelector();

        const selectedObject = objectSelector.getSelected();
        const objects = scene.getObjects();
        const camera = scene.getCamera();

        objects.forEach((object) => {
            object.getMeshes().forEach((mesh) => {
                const modelMatrix = object.getMeshModelMatrix(mesh);
                const isSelected = selectedObject?.entity?.object === object;

                const aabb = mesh.getAABB();
                const aabbIndices = aabb.getIndices();

                this.setVariables(
                    aabb.getVertices(),
                    aabbIndices,
                    modelMatrix,
                    isSelected ? [1.0, 0.0, 0.0, 1.0] : [0.0, 1.0, 0.0, 1.0],
                    camera
                );

                this.webgl.drawElements(
                    this.webgl.LINES,
                    aabbIndices.length,
                    this.webgl.UNSIGNED_SHORT,
                    0
                );
            });
        });

        const gizmoModel = Gizmo.getGizmoModel();
        const selected = Gizmo.getObjectSelector().getSelected().entity;

        gizmoModel.getMeshes().forEach((mesh) => {
            const modelMatrix = gizmoModel.getMeshModelMatrix(mesh);
            const isSelected = selected?.mesh === mesh;

            const aabb = mesh.getAABB();
            const aabbIndices = aabb.getIndices();

            this.setVariables(
                aabb.getVertices(),
                aabbIndices,
                modelMatrix,
                isSelected ? [1.0, 0.0, 0.0, 1.0] : [0.0, 1.0, 0.0, 1.0],
                camera
            );

            this.webgl.drawElements(
                this.webgl.LINES,
                aabbIndices.length,
                this.webgl.UNSIGNED_SHORT,
                0
            );
        });

        const rays = objectSelector.getRays();

        const modelMatrix = mat4.create();
        mat4.identity(modelMatrix);

        rays.forEach((ray) => {
            const lineToDraw = ray.getLine();
            this.setVariables(
                lineToDraw.vertices,
                lineToDraw.indices,
                modelMatrix,
                [0.0, 0.0, 1.0, 1.0],
                camera
            );

            this.webgl.drawElements(
                this.webgl.LINES,
                lineToDraw.indices.length,
                this.webgl.UNSIGNED_SHORT,
                0
            );
        });
    }

    public updateView(view: mat4) {
        this.viewMatUniform.setData(view);
    }

    public useProgram() {
        super.useProgram();
        this.setAttributes();
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
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

    private setVariables(
        vertices: LineProgramVertices,
        indices: LineProgramIndices,
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
