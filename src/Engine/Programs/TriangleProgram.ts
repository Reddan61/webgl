import { mat4 } from "gl-matrix";
import { fragmentShader } from "../shaders/triangles/fragment";
import { vertexShader } from "../shaders/triangles/vertex";
import { Program } from "./Program";
import {
    EngineObject,
    EngineObjectGeometry,
    EngineObjectMaterials,
} from "../Engine";

export class TriangleProgram extends Program {
    private vertexBuffer: WebGLBuffer;
    private textureCoordsBuffer: WebGLBuffer;
    private normalsBuffer: WebGLBuffer;
    private indicesBuffer: WebGLBuffer;

    private transformationLocation: WebGLUniformLocation;
    private normalMatLocation: WebGLUniformLocation;
    private viewLocation: WebGLUniformLocation;
    private colorFactorLocation: WebGLUniformLocation;
    private useTextureLocation: WebGLUniformLocation;

    private vertexAttributeLocation: number;
    private normalsAttributeLocation: number;
    private vertexTextureLocation: number;

    constructor(webgl: WebGLRenderingContext, perspective: mat4, view: mat4) {
        super(webgl);
        this.Init(vertexShader, fragmentShader);
        this.useProgram();
        this.initBuffers();
        this.matrixInit(perspective, view);
    }

    public setVariables(
        engineObject: EngineObject,
        geometry: EngineObjectGeometry,
        materials: EngineObjectMaterials,
        useTexture: boolean
    ) {
        this.setVertexShaderBuffers(
            engineObject,
            geometry,
            materials,
            useTexture
        );
    }

    public draw(geometry: EngineObjectGeometry) {
        this.webgl.drawElements(
            this.webgl.TRIANGLES,
            geometry.indices.length,
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
            3 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.webgl.enableVertexAttribArray(this.vertexAttributeLocation);

        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.normalsBuffer);
        this.webgl.vertexAttribPointer(
            this.normalsAttributeLocation,
            3,
            this.webgl.FLOAT,
            true,
            3 * Float32Array.BYTES_PER_ELEMENT,
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
            2 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.webgl.enableVertexAttribArray(this.vertexTextureLocation);
    }

    private initBuffers() {
        this.vertexBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.textureCoordsBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.normalsBuffer = this.webgl.createBuffer() as WebGLBuffer;

        this.indicesBuffer = this.webgl.createBuffer() as WebGLBuffer;

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

        this.webgl.uniformMatrix4fv(this.viewLocation, false, view);
        this.webgl.uniformMatrix4fv(projectionLocation, false, perspective);
    }

    private setVertexShaderBuffers(
        engineObject: EngineObject,
        geometry: EngineObjectGeometry,
        materials: EngineObjectMaterials,
        useTexture: boolean
    ) {
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.vertexBuffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            geometry.vertices,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.bindBuffer(
            this.webgl.ARRAY_BUFFER,
            this.textureCoordsBuffer
        );
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            geometry.textureCoords,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.normalsBuffer);
        this.webgl.bufferData(
            this.webgl.ARRAY_BUFFER,
            geometry.normals,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.bindBuffer(
            this.webgl.ELEMENT_ARRAY_BUFFER,
            this.indicesBuffer
        );
        this.webgl.bufferData(
            this.webgl.ELEMENT_ARRAY_BUFFER,
            geometry.indices,
            this.webgl.DYNAMIC_DRAW
        );

        this.webgl.uniformMatrix4fv(
            this.transformationLocation,
            false,
            engineObject.object.getModelMatrix()
        );
        this.webgl.uniformMatrix3fv(
            this.normalMatLocation,
            false,
            engineObject.object.getNormalMatrix()
        );
        this.webgl.uniform1i(this.useTextureLocation, Number(useTexture));
        this.webgl.uniform4fv(this.colorFactorLocation, materials.colorFactor);

        this.webgl.bindTexture(this.webgl.TEXTURE_2D, materials.baseTexture);
        this.webgl.activeTexture(this.webgl.TEXTURE0);
    }
}
