import { mat3, mat4, vec4 } from "gl-matrix";
import { fragmentShader } from "../shaders/triangles/fragment";
import { vertexShader } from "../shaders/triangles/vertex";
import { Program } from "./Program";
import { ElementBuffer } from "./Buffer/ElementBuffer";
import { ArrayBuffer } from "./Buffer/ArrayBuffer";
import { UniformMatrix4fv } from "./Uniform/UniformMatrix4fv";
import { UniformMatrix3fv } from "./Uniform/UniformMatrix3fv";
import { Uniform1i } from "./Uniform/Uniform1i";
import { Uniform4fv } from "./Uniform/Uniform4fv";
import { Uniform3fv } from "./Uniform/Uniform3fv";

export class TriangleProgram extends Program {
    private indicesBuffer: ElementBuffer;
    private vertexBuffer: ArrayBuffer;
    private textureCoordsBuffer: ArrayBuffer;
    private normalsBuffer: ArrayBuffer;
    private weightsBuffer: ArrayBuffer;
    private bonesIndexesBuffer: ArrayBuffer;

    private useTextureUniform: Uniform1i;
    private useBonesUniform: Uniform1i;
    private ambientIntensityUniform: Uniform3fv;
    private directionalLightIntensityUniform: Uniform3fv;
    private directionalLightDirUniform: Uniform3fv;
    private colorFactorUniform: Uniform4fv;

    private normalMatUniform: UniformMatrix3fv;
    private transformationMatrix: UniformMatrix4fv;
    private bonesUniform: UniformMatrix4fv;
    private viewMatUniform: UniformMatrix4fv;

    constructor(webgl: WebGLRenderingContext, perspective: mat4, view: mat4) {
        super(webgl);
        this.Init(vertexShader, fragmentShader);
        super.useProgram();
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
        this.viewMatUniform.setData(view);
    }

    public useProgram() {
        super.useProgram();
        this.setAttributes();
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
        this.normalsBuffer.setAttributes();
        this.textureCoordsBuffer.setAttributes();
        this.weightsBuffer.setAttributes();
        this.bonesIndexesBuffer.setAttributes();
    }

    private initBuffers() {
        this.indicesBuffer = new ElementBuffer(this.webgl);

        this.vertexBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "vertexPosition",
            3,
            this.webgl.FLOAT
        );

        this.textureCoordsBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "textureCoords",
            2,
            this.webgl.FLOAT
        );

        this.normalsBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "normals",
            3,
            this.webgl.FLOAT
        );

        this.weightsBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "weight",
            4,
            this.webgl.FLOAT
        );

        this.bonesIndexesBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "boneIndexes",
            4,
            this.webgl.FLOAT
        );

        this.setAttributes();
    }

    private matrixInit(perspective: mat4, view: mat4) {
        this.viewMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "view"
        );
        this.transformationMatrix = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "transformation"
        );
        this.normalMatUniform = new UniformMatrix3fv(
            this.webgl,
            this.program,
            "normalMat"
        );
        this.useTextureUniform = new Uniform1i(
            this.webgl,
            this.program,
            "useTexture"
        );

        this.ambientIntensityUniform = new Uniform3fv(
            this.webgl,
            this.program,
            "ambientIntensity"
        );

        this.directionalLightIntensityUniform = new Uniform3fv(
            this.webgl,
            this.program,
            "directionalLight.intensity"
        );

        this.directionalLightDirUniform = new Uniform3fv(
            this.webgl,
            this.program,
            "directionalLight.direction"
        );

        this.colorFactorUniform = new Uniform4fv(
            this.webgl,
            this.program,
            "colorFactor"
        );

        const projectionMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "projection"
        );

        this.bonesUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "bones"
        );
        this.useBonesUniform = new Uniform1i(
            this.webgl,
            this.program,
            "useBones"
        );

        this.viewMatUniform.setData(view);
        projectionMatUniform.setData(perspective);
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
        ambientIntensity,
        directionalLightDir,
        directionalLightIntensity,
    }: {
        useTexture: boolean;
        useBones: boolean;
        indices: Uint16Array;
        vertices: Float32Array;
        joints: Float32Array;
        weights: Float32Array;
        normals: Float32Array;
        textureCoords: Float32Array;
        ambientIntensity: Float32Array;
        directionalLightIntensity: Float32Array;
        directionalLightDir: Float32Array;
        bonesMatrices: mat4 | null;
        modelMatrix: mat4;
        normalMatrix: mat3;
        texture: WebGLTexture | null;
        colorFactor: vec4;
    }) {
        this.indicesBuffer.setBufferData(indices);

        this.vertexBuffer.setBufferData(vertices);
        this.textureCoordsBuffer.setBufferData(textureCoords);
        this.normalsBuffer.setBufferData(normals);
        this.weightsBuffer.setBufferData(weights);
        this.bonesIndexesBuffer.setBufferData(joints);

        this.useBonesUniform.setData(Number(useBones));
        this.useTextureUniform.setData(Number(useTexture));

        this.ambientIntensityUniform.setData(ambientIntensity);
        this.directionalLightIntensityUniform.setData(
            directionalLightIntensity
        );
        this.directionalLightDirUniform.setData(directionalLightDir);

        this.bonesUniform.setData(bonesMatrices ?? mat4.create());
        this.colorFactorUniform.setData(colorFactor);

        this.transformationMatrix.setData(modelMatrix);
        this.normalMatUniform.setData(normalMatrix);

        this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
        this.webgl.activeTexture(this.webgl.TEXTURE0);
    }
}
