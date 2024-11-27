import { mat4, vec4 } from "gl-matrix";
import { Program } from "./Program";
import { vertexShader } from "../shaders/lines/vertex";
import { fragmentShader } from "../shaders/lines/fragment";
import { ArrayBuffer } from "./Buffer/ArrayBuffer";
import { ElementBuffer } from "./Buffer/ElementBuffer";
import { UniformMatrix4fv } from "./Uniform/UniformMatrix4fv";
import { Uniform4fv } from "./Uniform/Uniform4fv";
import { Scene } from "../Scene";
import { ObjectSelector } from "../ObjectSelector";

export type LineProgramVertices = Float32Array;
export type LineProgramIndices = Uint16Array;

export class LineProgram extends Program {
    private vertexBuffer: ArrayBuffer;
    private indicesBuffer: ElementBuffer;

    private transformationMatUniform: UniformMatrix4fv;
    private viewMatUniform: UniformMatrix4fv;
    private colorUniform: Uniform4fv;

    constructor(webgl: WebGL2RenderingContext, perspective: mat4, view: mat4) {
        super(webgl);
        this.Init(vertexShader, fragmentShader);
        super.useProgram();
        this.initBuffers();
        this.matrixInit(perspective, view);
    }

    public draw(scene: Scene, objectSelector: ObjectSelector) {
        this.useProgram();
        this.updateView(scene.getCamera().getView());

        const selectedObject = objectSelector.getSelected();
        const objects = scene.getObjects();

        objects.forEach((object) => {
            const modelMatrix = object.getModelMatrix();
            const isSelected = selectedObject?.object === object;

            const aabb = object.getAABB();
            const aabbIndices = aabb.getIndices();

            this.setVariables(
                aabb.getVertices(),
                aabbIndices,
                modelMatrix,
                isSelected ? [1.0, 0.0, 0.0, 1.0] : [0.0, 1.0, 0.0, 1.0]
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
                [0.0, 0.0, 1.0, 1.0]
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

    public setVariables(
        vertices: LineProgramVertices,
        indices: LineProgramIndices,
        modelMatrix: mat4,
        color: vec4
    ) {
        this.setVertexShaderBuffers(vertices, indices, modelMatrix, color);
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

    private matrixInit(perspective: mat4, view: mat4) {
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

        const projectionMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "projection"
        );
        this.colorUniform = new Uniform4fv(this.webgl, this.program, "color");

        this.viewMatUniform.setData(view);
        projectionMatUniform.setData(perspective);
    }

    private setVertexShaderBuffers(
        vertices: LineProgramVertices,
        indices: LineProgramIndices,
        modelMatrix: mat4,
        color: vec4
    ) {
        this.vertexBuffer.setBufferData(vertices);
        this.indicesBuffer.setBufferData(indices);

        this.transformationMatUniform.setData(modelMatrix);
        this.colorUniform.setData(color);
    }
}
