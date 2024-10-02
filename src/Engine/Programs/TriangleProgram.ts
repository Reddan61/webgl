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
import { PointLight } from "../Light/PointLight";
import { DirectionalLight } from "../Light/DirectionalLight";
import { AmbientLight } from "../Light/AmbientLight";
import { Uniform1f } from "./Uniform/Uniform1f";

export class TriangleProgram extends Program {
    private indicesBuffer: ElementBuffer;
    private vertexBuffer: ArrayBuffer;
    private textureCoordsBuffer: ArrayBuffer;
    private normalsBuffer: ArrayBuffer;
    private weightsBuffer: ArrayBuffer;
    private bonesIndexesBuffer: ArrayBuffer;

    private useTextureUniform: Uniform1i;
    private useBonesUniform: Uniform1i;
    private useLightUniform: Uniform1i;

    private ambientLightBrightUniform: Uniform1f;
    private ambientLightColorUniform: Uniform3fv;

    private directionalLightBrightUniform: Uniform1f;
    private directionalLightColorUniform: Uniform3fv;
    private directionalLightDirUniform: Uniform3fv;

    private cameraPositionUniform: Uniform3fv;

    private colorFactorUniform: Uniform4fv;

    private normalMatUniform: UniformMatrix3fv;
    private transformationMatrix: UniformMatrix4fv;
    private bonesUniform: UniformMatrix4fv;
    private viewMatUniform: UniformMatrix4fv;

    private pointLights: {
        pointLightBrightUniform: Uniform1f;
        pointLightColorUniform: Uniform3fv;
        pointLightPositionUniform: Uniform3fv;
    }[] = [];

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

        this.ambientLightColorUniform = new Uniform3fv(
            this.webgl,
            this.program,
            "ambientLight.color"
        );
        this.ambientLightBrightUniform = new Uniform1f(
            this.webgl,
            this.program,
            "ambientLight.bright"
        );

        this.directionalLightColorUniform = new Uniform3fv(
            this.webgl,
            this.program,
            "directionalLight.color"
        );

        this.directionalLightBrightUniform = new Uniform1f(
            this.webgl,
            this.program,
            "directionalLight.bright"
        );

        this.directionalLightDirUniform = new Uniform3fv(
            this.webgl,
            this.program,
            "directionalLight.direction"
        );

        this.cameraPositionUniform = new Uniform3fv(
            this.webgl,
            this.program,
            "cameraPosition"
        );

        for (let i = 0; i < 100; i++) {
            this.pointLights.push({
                pointLightBrightUniform: new Uniform1f(
                    this.webgl,
                    this.program,
                    `pointLights[${i}].bright`
                ),
                pointLightColorUniform: new Uniform3fv(
                    this.webgl,
                    this.program,
                    `pointLights[${i}].color`
                ),
                pointLightPositionUniform: new Uniform3fv(
                    this.webgl,
                    this.program,
                    `pointLights[${i}].position`
                ),
            });
        }

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
        this.useLightUniform = new Uniform1i(
            this.webgl,
            this.program,
            "useLight"
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
        ambientLight,
        pointLights,
        useLight,
        cameraPosition,
        directionalLight,
    }: {
        useTexture: boolean;
        useBones: boolean;
        indices: Uint16Array;
        vertices: Float32Array;
        joints: Float32Array;
        weights: Float32Array;
        normals: Float32Array;
        textureCoords: Float32Array;
        ambientLight: AmbientLight;
        directionalLight: DirectionalLight;
        pointLights: PointLight[];
        bonesMatrices: mat4 | null;
        modelMatrix: mat4;
        normalMatrix: mat3;
        texture: WebGLTexture | null;
        colorFactor: vec4;
        cameraPosition: Float32Array;
        useLight: boolean;
    }) {
        this.indicesBuffer.setBufferData(indices);

        this.vertexBuffer.setBufferData(vertices);
        this.textureCoordsBuffer.setBufferData(textureCoords);
        this.normalsBuffer.setBufferData(normals);
        this.weightsBuffer.setBufferData(weights);
        this.bonesIndexesBuffer.setBufferData(joints);

        this.useBonesUniform.setData(Number(useBones));
        this.useTextureUniform.setData(Number(useTexture));
        this.useLightUniform.setData(Number(useLight));

        this.ambientLightBrightUniform.setData(ambientLight.getBright());
        this.ambientLightColorUniform.setData(
            new Float32Array(ambientLight.getColor())
        );

        this.directionalLightBrightUniform.setData(
            directionalLight.getBright()
        );
        this.directionalLightColorUniform.setData(
            new Float32Array(directionalLight.getColor())
        );
        this.directionalLightDirUniform.setData(
            new Float32Array(directionalLight.getDirection())
        );
        this.cameraPositionUniform.setData(cameraPosition);

        for (let i = 0; i < pointLights.length; i++) {
            const current = pointLights[i];
            const pointLightColor = new Float32Array(current.getColor());
            const pointLightPosition = new Float32Array(current.getPosition());
            const pointLightBright = current.getBright();

            this.pointLights[i].pointLightColorUniform.setData(pointLightColor);
            this.pointLights[i].pointLightPositionUniform.setData(
                pointLightPosition
            );
            this.pointLights[i].pointLightBrightUniform.setData(
                pointLightBright
            );
        }

        this.bonesUniform.setData(bonesMatrices ?? mat4.create());
        this.colorFactorUniform.setData(colorFactor);

        this.transformationMatrix.setData(modelMatrix);
        this.normalMatUniform.setData(normalMatrix);

        this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);

        this.webgl.activeTexture(this.webgl.TEXTURE0);
    }
}
