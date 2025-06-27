import { mat4, vec2 } from "gl-matrix";
import { vertex } from "./shaders/vertex";
import { fragment } from "./shaders/fragment";
import { Scene } from "engine/Scene";
import { Program } from "engine/Programs/Program";
import { PointLight } from "engine/Light/PointLight";
import { Uniform1i } from "engine/Programs/Uniform/Uniform1i";
import { Uniform1f } from "engine/Programs/Uniform/Uniform1f";
import { Uniform3fv } from "engine/Programs/Uniform/Uniform3fv";
import { ArrayBuffer } from "engine/Programs/Buffer/ArrayBuffer";
import { DataTexture } from "engine/Programs/Texture/DataTexture";
import { ElementBuffer } from "engine/Programs/Buffer/ElementBuffer";
import { TextureUniform } from "engine/Programs/Uniform/TextureUniform";
import { UniformMatrix4fv } from "engine/Programs/Uniform/UniformMatrix4fv";

export class ShadowAtlasProgram extends Program {
    private SHADOW_MAP_WIDTH = 2048;
    private SHADOW_MAP_HEIGHT = 2048;

    private shadowMapTexture: DataTexture;
    private shadowFrameBuffer: WebGLFramebuffer;

    private vertexBuffer: ArrayBuffer;
    private weightsBuffer: ArrayBuffer;
    private bonesIndexesBuffer: ArrayBuffer;
    private indicesBuffer: ElementBuffer;

    private farPlaneUniform: Uniform1f;
    private lightPositionUniform: Uniform3fv;
    private viewMatrixUniform: UniformMatrix4fv;
    private projMatrixUniform: UniformMatrix4fv;
    private modelMatrixUniform: UniformMatrix4fv;

    private useBonesUniform: Uniform1i;
    private bonesDataTextureUniform: TextureUniform;
    private bonesCountUniform: Uniform1f;

    constructor(webgl: WebGL2RenderingContext) {
        super(webgl);

        this.shadowMapTexture = new DataTexture(this.webgl);
        this.shadowMapTexture.setData(
            null,
            this.SHADOW_MAP_WIDTH,
            this.SHADOW_MAP_HEIGHT,
            this.webgl.DEPTH_COMPONENT24,
            this.webgl.DEPTH_COMPONENT,
            this.webgl.UNSIGNED_INT
        );

        this.shadowFrameBuffer =
            this.webgl.createFramebuffer() as WebGLFramebuffer;

        this.webgl.bindFramebuffer(
            this.webgl.FRAMEBUFFER,
            this.shadowFrameBuffer
        );
        this.webgl.framebufferTexture2D(
            this.webgl.FRAMEBUFFER,
            this.webgl.DEPTH_ATTACHMENT,
            this.webgl.TEXTURE_2D,
            this.shadowMapTexture.getTexture(),
            0
        );

        if (
            this.webgl.checkFramebufferStatus(this.webgl.FRAMEBUFFER) !==
            this.webgl.FRAMEBUFFER_COMPLETE
        ) {
            console.error("Framebuffer is not complete");
        }

        this.webgl.bindFramebuffer(this.webgl.FRAMEBUFFER, null);

        this.Init(vertex, fragment);
        super.useProgram();
        this.initBuffers();
        this.initUniforms();
    }

    public useProgram() {
        super.useProgram();
        this.setAttributes();
    }

    public draw(scene: Scene) {
        const pointLights = scene.getPointLights();
        const objects = scene.getObjects();

        const pointLightsWithShadow = pointLights.filter((light) =>
            light.getWithShadow()
        );

        // 6 граней (cubeTexture)
        const numCols = 6;
        const numRows = pointLightsWithShadow.length;

        const atlasSizePerElementX = this.SHADOW_MAP_WIDTH / numCols;
        const atlasSizePerElementY = this.SHADOW_MAP_HEIGHT / numRows;

        const atlasScaleX = atlasSizePerElementX / this.SHADOW_MAP_WIDTH;
        const atlasScaleY = atlasSizePerElementY / this.SHADOW_MAP_HEIGHT;

        this.useProgram();
        this.bind();

        for (let i = 0; i < 6; i++) {
            pointLightsWithShadow.forEach((light, lightIndex) => {
                const withShadow = light.getWithShadow();

                if (!withShadow) return;

                const cubeFaceIndex = lightIndex * 6 + i;
                const col = cubeFaceIndex % numCols;
                const row = Math.floor(cubeFaceIndex / numCols);

                const atlasX = col * atlasSizePerElementX;
                const atlasY = row * atlasSizePerElementY;

                const atlasOffsetX = 0;
                const atlasOffsetY = lightIndex * atlasScaleY;

                light._setAtlas(
                    vec2.fromValues(atlasScaleX, atlasScaleY),
                    vec2.fromValues(atlasOffsetX, atlasOffsetY)
                );

                this.webgl.viewport(
                    atlasX,
                    atlasY,
                    atlasSizePerElementX,
                    atlasSizePerElementY
                );

                objects.forEach((object) => {
                    const skeleton = object.getSkeleton();

                    object.getMeshes().forEach((mesh) => {
                        if (mesh.getLight()) {
                            return null;
                        }

                        const skinIndex = mesh.getSkinIndex();
                        const skin = skeleton?.getSkinByIndex(skinIndex);

                        const boneMatrices = skin?.getSkinningMatrices();
                        const useBones = !!boneMatrices;

                        const meshTransform = mesh.getTransform();
                        const globalTransformationMatrix =
                            meshTransform.getGlobalModelMatrix();

                        mesh.getPrimitives().forEach((prim) => {
                            this.setVariables({
                                useBones,
                                modelMatrix: globalTransformationMatrix,
                                index: i,
                                pointLight: light,
                                indices: prim.getIndices(),
                                joints: prim.getJoints(),
                                weights: prim.getWeights(),
                                vertices: prim.getVertices(),
                                bonesDataTexture:
                                    skin?.getBonesDataTexture() ?? null,
                                bonesCount: skin?.getJointsCount() ?? 0,
                            });

                            this.webgl.drawElements(
                                this.webgl.TRIANGLES,
                                prim.getIndices().length,
                                this.webgl.UNSIGNED_SHORT,
                                0
                            );
                        });
                    });
                });
            });
        }

        this.unbind();
    }

    private bind() {
        this.webgl.bindFramebuffer(
            this.webgl.FRAMEBUFFER,
            this.shadowFrameBuffer
        );
        this.webgl.viewport(
            0,
            0,
            this.SHADOW_MAP_WIDTH,
            this.SHADOW_MAP_HEIGHT
        );
        this.webgl.clear(this.webgl.DEPTH_BUFFER_BIT);
    }

    private unbind() {
        this.webgl.bindFramebuffer(this.webgl.FRAMEBUFFER, null);
    }

    private setVariables({
        indices,
        vertices,
        joints,
        weights,
        modelMatrix,
        pointLight,
        index,
        bonesCount,
        bonesDataTexture,
        useBones,
    }: {
        indices: Uint16Array;
        vertices: Float32Array;
        joints: Float32Array;
        weights: Float32Array;
        modelMatrix: mat4;
        pointLight: PointLight;
        index: number;
        useBones: boolean;
        bonesCount: number;
        bonesDataTexture: DataTexture | null;
    }) {
        this.indicesBuffer.setBufferData(indices);
        this.vertexBuffer.setBufferData(vertices);
        this.weightsBuffer.setBufferData(weights);
        this.bonesIndexesBuffer.setBufferData(joints);

        this.farPlaneUniform.setData(pointLight.getFarPlane());
        this.viewMatrixUniform.setData(pointLight.getLightMatrices()[index]);
        this.projMatrixUniform.setData(pointLight.getProjMatrix());
        this.modelMatrixUniform.setData(modelMatrix);
        this.lightPositionUniform.setData(
            new Float32Array(pointLight.getPosition())
        );

        this.useBonesUniform.setData(Number(useBones));
        this.bonesDataTextureUniform.setData(
            bonesDataTexture?.getTexture() ?? null
        );
        this.bonesCountUniform.setData(bonesCount);
    }

    public getAtlasTexture() {
        return this.shadowMapTexture;
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
    }

    private initUniforms() {
        this.farPlaneUniform = new Uniform1f(
            this.webgl,
            this.program,
            "farPlane"
        );

        this.lightPositionUniform = new Uniform3fv(
            this.webgl,
            this.program,
            "lightPos"
        );

        this.viewMatrixUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "viewMatrix"
        );
        this.projMatrixUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "projMatrix"
        );
        this.modelMatrixUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "modelMatrix"
        );

        this.useBonesUniform = new Uniform1i(
            this.webgl,
            this.program,
            "useBones"
        );

        this.bonesDataTextureUniform = new TextureUniform(
            this.webgl,
            this.program,
            "bonesDataTexture",
            2,
            this.webgl.TEXTURE2
        );

        this.bonesCountUniform = new Uniform1f(
            this.webgl,
            this.program,
            "numBones"
        );
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
        this.weightsBuffer.setAttributes();
        this.bonesIndexesBuffer.setAttributes();
    }
}
