import { mat4, vec4 } from "gl-matrix";
import { Program } from "./Program";
import { vertexShader } from "../shaders/lines/vertex";
import { fragmentShader } from "../shaders/lines/fragment";

export type LineProgramVertices = Float32Array;
export type LineProgramIndices = Uint16Array;

export class LineProgram extends Program {
    private vertexBuffer: WebGLBuffer;
    private indicesBuffer: WebGLBuffer;

    private vertexAttributeLocation: number;

    private transformationLocation: WebGLUniformLocation;
    private viewLocation: WebGLUniformLocation;
    private colorLocation: WebGLUniformLocation;

    constructor(webgl: WebGLRenderingContext, perspective: mat4, view: mat4) {
        super(webgl);
        this.Init(vertexShader, fragmentShader);
        this.useProgram();
        this.initBuffers();
        this.matrixInit(perspective, view);
    }

    public draw(indices: Uint16Array) {
        this.webgl.drawElements(
            this.webgl.LINES,
            indices.length,
            this.webgl.UNSIGNED_SHORT,
            0
        );
    }

    public updateView(view: mat4) {
        this.webgl.uniformMatrix4fv(this.viewLocation, false, view);
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
        this.setAttributes();
        super.useProgram();
    }

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
        this.vertexBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.indicesBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.vertexAttributeLocation = this.webgl.getAttribLocation(
            this.program,
            "vertexPosition"
        );

        this.setAttributes();
    }

    private matrixInit(perspective: mat4, view: mat4) {
        this.viewLocation = this.webgl.getUniformLocation(
            this.program,
            "view"
        ) as WebGLUniformLocation;
        this.transformationLocation = this.webgl.getUniformLocation(
            this.program,
            "transformation"
        ) as WebGLUniformLocation;
        const projectionLocation = this.webgl.getUniformLocation(
            this.program,
            "projection"
        );
        this.colorLocation = this.webgl.getUniformLocation(
            this.program,
            "color"
        ) as WebGLUniformLocation;

        this.webgl.uniformMatrix4fv(this.viewLocation, false, view);
        this.webgl.uniformMatrix4fv(projectionLocation, false, perspective);
    }

    private setVertexShaderBuffers(
        vertices: LineProgramVertices,
        indices: LineProgramIndices,
        modelMatrix: mat4,
        color: vec4
    ) {
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.vertexBuffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            vertices,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.bindBuffer(
            this.webgl.ELEMENT_ARRAY_BUFFER,
            this.indicesBuffer
        );
        this.webgl.bufferData(
            this.webgl.ELEMENT_ARRAY_BUFFER,
            indices,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.uniformMatrix4fv(
            this.transformationLocation,
            false,
            modelMatrix
        );

        this.webgl.uniform4fv(this.colorLocation, color);
    }
}
