import { mat3, mat4, vec4 } from "gl-matrix";
import { fragmentShader } from "../shaders/triangles/fragment";
import { vertexShader } from "../shaders/triangles/vertex";
import { Program } from "./Program";

export class TriangleProgram extends Program {
    private vertexBuffer: WebGLBuffer;
    private textureCoordsBuffer: WebGLBuffer;
    private normalsBuffer: WebGLBuffer;
    private indicesBuffer: WebGLBuffer;
    private weightsBuffer: WebGLBuffer;
    private bonesIndexesBuffer: WebGLBuffer;

    private transformationLocation: WebGLUniformLocation;
    private normalMatLocation: WebGLUniformLocation;
    private viewLocation: WebGLUniformLocation;
    private colorFactorLocation: WebGLUniformLocation;
    private useTextureLocation: WebGLUniformLocation;
    private bonesLocation: WebGLUniformLocation;
    private useBonesLocation: WebGLUniformLocation;

    private vertexAttributeLocation: number;
    private normalsAttributeLocation: number;
    private vertexTextureLocation: number;
    private weightsAttributeLocation: number;
    private bonesIndexesAttributeLocation: number;

    constructor(webgl: WebGLRenderingContext, perspective: mat4, view: mat4) {
        super(webgl);
        this.Init(vertexShader, fragmentShader);
        this.useProgram();
        this.initBuffers();
        this.matrixInit(perspective, view);
    }

    public setVariables(
        parameters: Parameters<typeof this.setVertexShaderBuffers>[0]
    ) {
        this.setVertexShaderBuffers(parameters);
    }

    public draw(indices: Uint16Array) {
        this.webgl.drawElements(
            this.webgl.TRIANGLES,
            indices.length,
            this.webgl.UNSIGNED_SHORT,
            0
        );
    }

    public updateView(view: mat4) {
        this.webgl.uniformMatrix4fv(this.viewLocation, false, view);
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
            0,
            0
        );
        this.webgl.enableVertexAttribArray(this.vertexAttributeLocation);

        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.normalsBuffer);
        this.webgl.vertexAttribPointer(
            this.normalsAttributeLocation,
            3,
            this.webgl.FLOAT,
            true,
            0,
            0
        );
        this.webgl.enableVertexAttribArray(this.normalsAttributeLocation);

        this.webgl.bindBuffer(
            this.webgl.ARRAY_BUFFER,
            this.textureCoordsBuffer
        );
        this.webgl.vertexAttribPointer(
            this.vertexTextureLocation,
            2,
            this.webgl.FLOAT,
            false,
            0,
            0
        );
        this.webgl.enableVertexAttribArray(this.vertexTextureLocation);

        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.weightsBuffer);
        this.webgl.vertexAttribPointer(
            this.weightsAttributeLocation,
            4,
            this.webgl.FLOAT,
            false,
            0,
            0
        );
        this.webgl.enableVertexAttribArray(this.weightsAttributeLocation);

        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.bonesIndexesBuffer);
        this.webgl.vertexAttribPointer(
            this.bonesIndexesAttributeLocation,
            4,
            this.webgl.FLOAT,
            false,
            0,
            0
        );
        this.webgl.enableVertexAttribArray(this.bonesIndexesAttributeLocation);
    }

    private initBuffers() {
        this.vertexBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.textureCoordsBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.normalsBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.indicesBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.weightsBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.bonesIndexesBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.vertexAttributeLocation = this.webgl.getAttribLocation(
            this.program,
            "vertexPosition"
        );
        this.normalsAttributeLocation = this.webgl.getAttribLocation(
            this.program,
            "normals"
        );
        this.vertexTextureLocation = this.webgl.getAttribLocation(
            this.program,
            "textureCoords"
        );

        this.weightsAttributeLocation = this.webgl.getAttribLocation(
            this.program,
            "weight"
        );

        this.bonesIndexesAttributeLocation = this.webgl.getAttribLocation(
            this.program,
            "boneIndexes"
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
        this.normalMatLocation = this.webgl.getUniformLocation(
            this.program,
            "normalMat"
        ) as WebGLUniformLocation;
        this.useTextureLocation = this.webgl.getUniformLocation(
            this.program,
            "useTexture"
        ) as WebGLUniformLocation;
        this.colorFactorLocation = this.webgl.getUniformLocation(
            this.program,
            "colorFactor"
        ) as WebGLUniformLocation;

        const projectionLocation = this.webgl.getUniformLocation(
            this.program,
            "projection"
        );

        this.bonesLocation = this.webgl.getUniformLocation(
            this.program,
            "bones"
        ) as WebGLUniformLocation;

        this.useBonesLocation = this.webgl.getUniformLocation(
            this.program,
            "useBones"
        ) as WebGLUniformLocation;

        this.webgl.uniformMatrix4fv(this.viewLocation, false, view);
        this.webgl.uniformMatrix4fv(projectionLocation, false, perspective);
    }

    private setVertexShaderBuffers({
        joints,
        normals,
        textureCoords,
        useBones,
        useTexture,
        vertices,
        weights,
        indices,
        modelMatrix,
        normalMatrix,
        bonesMatrices,
        colorFactor,
        texture,
    }: {
        useTexture: boolean;
        useBones: boolean;
        indices: Uint16Array;
        vertices: Float32Array;
        joints: Float32Array;
        weights: Float32Array;
        normals: Float32Array;
        textureCoords: Float32Array;
        bonesMatrices: mat4 | null;
        modelMatrix: mat4;
        normalMatrix: mat3;
        texture: WebGLTexture | null;
        colorFactor: vec4;
    }) {
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.vertexBuffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            vertices,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.bindBuffer(
            this.webgl.ARRAY_BUFFER,
            this.textureCoordsBuffer
        );
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            textureCoords,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.normalsBuffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            normals,
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

        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.weightsBuffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            weights,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.bonesIndexesBuffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            joints,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.uniformMatrix4fv(
            this.transformationLocation,
            false,
            modelMatrix
        );
        this.webgl.uniformMatrix3fv(
            this.normalMatLocation,
            false,
            normalMatrix
        );

        this.webgl.uniformMatrix4fv(
            this.bonesLocation,
            false,
            bonesMatrices ?? mat4.create()
        );

        this.webgl.uniform1i(this.useBonesLocation, Number(useBones));

        this.webgl.uniform1i(this.useTextureLocation, Number(useTexture));
        this.webgl.uniform4fv(this.colorFactorLocation, colorFactor);

        this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
        this.webgl.activeTexture(this.webgl.TEXTURE0);
    }
}
