import { mat4 } from "gl-matrix";
import { Program } from "./Program";
import { vertexShader } from "../shaders/lines/vertex";
import { fragmentShader } from "../shaders/lines/fragment";
import { EngineObject, EngineObjectAABB } from "../Engine";

export class LineProgram extends Program {
    constructor(webgl: WebGLRenderingContext, perspective: mat4, view: mat4) {
        super(webgl);
        this.Init(vertexShader, fragmentShader);
        this.useProgram();
        this.initBuffers();
        this.matrixInit(perspective, view);
    }

    public draw(aabb: EngineObjectAABB) {
        this.webgl.drawElements(
            this.webgl.LINES,
            aabb.indices.length,
            this.webgl.UNSIGNED_SHORT,
            0
        );
    }

    public updateView(view: mat4) {
        this.webgl.uniformMatrix4fv(this.viewLocation, false, view);
    }

    public setVariables(engineObject: EngineObject, aabb: EngineObjectAABB) {
        this.setVertexShaderBuffers(engineObject, aabb);
    }

    public useProgram() {
        this.setAttributes();
        super.useProgram();
    }

    private vertexBuffer: WebGLBuffer = null;
    private indicesBuffer: WebGLBuffer = null;

    private vertexAttributeLocation: number | null = null;

    private transformationLocation: WebGLUniformLocation | null = null;
    private viewLocation: WebGLUniformLocation | null = null;

    private setAttributes() {
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.vertexBuffer);
        this.webgl.vertexAttribPointer(
            this.vertexAttributeLocation,
            3,
            this.webgl.FLOAT,
            false,
            3 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.webgl.enableVertexAttribArray(this.vertexAttributeLocation);
    }

    private initBuffers() {
        this.vertexBuffer = this.webgl.createBuffer();

        this.indicesBuffer = this.webgl.createBuffer();

        this.vertexAttributeLocation = this.webgl.getAttribLocation(
            this.program,
            "vertexPosition"
        );

        this.setAttributes();
    }

    private matrixInit(perspective: mat4, view: mat4) {
        this.viewLocation = this.webgl.getUniformLocation(this.program, "view");
        this.transformationLocation = this.webgl.getUniformLocation(
            this.program,
            "transformation"
        );
        const projectionLocation = this.webgl.getUniformLocation(
            this.program,
            "projection"
        );

        this.webgl.uniformMatrix4fv(this.viewLocation, false, view);
        this.webgl.uniformMatrix4fv(projectionLocation, false, perspective);
    }

    private setVertexShaderBuffers(
        engineObject: EngineObject,
        aabb: EngineObjectAABB
    ) {
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.vertexBuffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            aabb.vertices,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.bindBuffer(
            this.webgl.ELEMENT_ARRAY_BUFFER,
            this.indicesBuffer
        );
        this.webgl.bufferData(
            this.webgl.ELEMENT_ARRAY_BUFFER,
            aabb.indices,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.uniformMatrix4fv(
            this.transformationLocation,
            false,
            engineObject.object.getModelMatrix()
        );
    }
}
