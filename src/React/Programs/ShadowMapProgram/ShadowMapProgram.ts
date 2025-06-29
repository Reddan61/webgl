import { mat4 } from "gl-matrix";
import { vertex } from "./shaders/vertex";
import { fragment } from "./shaders/fragment";
import { Program } from "engine/Programs/Program";
import { DataTexture } from "engine/Programs/Texture/DataTexture";
import { ArrayBuffer } from "engine/Programs/Buffer/ArrayBuffer";
import { ElementBuffer } from "engine/Programs/Buffer/ElementBuffer";
import { UniformMatrix4fv } from "engine/Programs/Uniform/UniformMatrix4fv";
import { Uniform1i } from "engine/Programs/Uniform/Uniform1i";
import { TextureUniform } from "engine/Programs/Uniform/TextureUniform";
import { Uniform1f } from "engine/Programs/Uniform/Uniform1f";
import { Scene } from "engine/Scene";
import { DirectionalLight } from "engine/Light/DirectionalLight";

export class ShadowMapProgram extends Program {
    private SHADOW_MAP_WIDTH = 2048;
    private SHADOW_MAP_HEIGHT = 2048;

    private shadowMapTexture: DataTexture;
    private shadowFrameBuffer: WebGLFramebuffer;

    private vertexBuffer: ArrayBuffer;
    private weightsBuffer: ArrayBuffer;
    private bonesIndexesBuffer: ArrayBuffer;
    private indicesBuffer: ElementBuffer;

    private lightSpaceMatrixUniform: UniformMatrix4fv;
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
        this.useProgram();
        this.bind();

        scene.getObjects().forEach((object) => {
            const skeleton = object.getSkeleton();

            object.getMeshes().forEach((mesh) => {
                if (mesh.getLight()) return null;

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
                        indices: prim.getIndices(),
                        joints: prim.getJoints(),
                        weights: prim.getWeights(),
                        vertices: prim.getVertices(),
                        directionalLight: scene.getDirectionalLight(),
                        bonesDataTexture: skin?.getBonesDataTexture() ?? null,
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
        modelMatrix,
        directionalLight,
        bonesCount,
        bonesDataTexture,
        joints,
        useBones,
        weights,
    }: {
        indices: Uint16Array;
        vertices: Float32Array;
        joints: Float32Array;
        weights: Float32Array;
        modelMatrix: mat4;
        directionalLight: DirectionalLight;
        useBones: boolean;
        bonesCount: number;
        bonesDataTexture: DataTexture | null;
    }) {
        this.indicesBuffer.setBufferData(indices);
        this.vertexBuffer.setBufferData(vertices);
        this.weightsBuffer.setBufferData(weights);
        this.bonesIndexesBuffer.setBufferData(joints);

        this.lightSpaceMatrixUniform.setData(directionalLight.getLightMatrix());
        this.modelMatrixUniform.setData(modelMatrix);

        this.useBonesUniform.setData(Number(useBones));
        this.bonesDataTextureUniform.setData(
            bonesDataTexture?.getTexture() ?? null
        );
        this.bonesCountUniform.setData(bonesCount);
    }

    public getShadowMapTexture() {
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
        this.lightSpaceMatrixUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "lightSpaceMatrix"
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
