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
import { Uniform1f } from "./Uniform/Uniform1f";
import { ImageTexture } from "./Texture/ImageTexture";
import { TextureUniform } from "./Uniform/TextureUniform";
import { Scene } from "../Scene";
import { DataTexture } from "./Texture/DataTexture";
import { CubeTextureUniform } from "./Uniform/CubeTextureUniform";
import { CubeTexture } from "./Texture/CubeTexture";
import { ShadowAtlasProgram } from "./ShadowAtlasProgram";
import { ShadowMapProgram } from "./ShadowMapProgram";

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

    private objectTextureUniform: TextureUniform;
    private shadowMapTextureUniform: TextureUniform;
    private shadowAtlasTextureUniform: TextureUniform;
    private pointLightDataTextureUniform: TextureUniform;
    private pointLightNum: Uniform1f;

    private bonesDataTextureUniform: TextureUniform;
    private bonesCountUniform: Uniform1f;

    private ambientLightBrightUniform: Uniform1f;
    private ambientLightColorUniform: Uniform3fv;

    private directionalLightBrightUniform: Uniform1f;
    private directionalLightColorUniform: Uniform3fv;
    private directionalLightDirUniform: Uniform3fv;

    private cameraPositionUniform: Uniform3fv;

    private colorFactorUniform: Uniform4fv;

    private normalMatUniform: UniformMatrix3fv;
    private transformationMatrix: UniformMatrix4fv;
    private viewMatUniform: UniformMatrix4fv;
    private lightSpaceMatrixUniform: UniformMatrix4fv;

    constructor(webgl: WebGL2RenderingContext, perspective: mat4, view: mat4) {
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

    public draw(
        width: number,
        height: number,
        scene: Scene,
        shadowAtlasProgram: ShadowAtlasProgram,
        shadowMapProgram: ShadowMapProgram
    ) {
        this.useProgram();
        this.bind(width, height);

        const camera = scene.getCamera();
        const objects = scene.getObjects();

        this.updateView(camera.getView());

        objects.forEach((object) => {
            if (object.isSingleFace()) {
                this.disableCullFace();
            } else {
                this.enableCullFace();
            }

            object.getMeshes().forEach((mesh) => {
                const isLight = Boolean(mesh.getLight());
                const primitives = mesh.getPrimitives();
                primitives.forEach((prim) => {
                    const material = prim.getMaterial();

                    const useTexture = Boolean(material.baseTexture);
                    const boneMatrices = mesh.getSkeleton()?.matrices;
                    const useBones = !!boneMatrices;

                    this.setVariables({
                        useBones,
                        scene,
                        bonesDataTexture: mesh.getBonesDataTexture(),
                        bonesCount: mesh.getSkeletonBonesCount(),
                        shadowMapTexture:
                            shadowMapProgram.getShadowMapTexture(),
                        shadowAtlasTexture:
                            shadowAtlasProgram.getAtlasTexture(),
                        useTexture,
                        useLight: !isLight,
                        colorFactor: material.colorFactor,
                        objectTexture: material.baseTexture,
                        indices: prim.getIndices(),
                        joints: prim.getJoints(),
                        normals: prim.getNormals(),
                        textureCoords: prim.getTextureCoords(),
                        vertices: prim.getVertices(),
                        weights: prim.getWeights(),
                        modelMatrix: object.getModelMatrix(),
                        normalMatrix: object.getNormalMatrix(),
                        cameraPosition: new Float32Array(camera.getPosition()),
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
    }

    private bind(width: number, height: number) {
        this.webgl.viewport(0, 0, width, height);
        this.webgl.clear(
            this.webgl.DEPTH_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
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

    private enableCullFace() {
        this.webgl.enable(this.webgl.CULL_FACE);
        this.webgl.frontFace(this.webgl.CCW);
        this.webgl.cullFace(this.webgl.BACK);
    }

    private disableCullFace() {
        this.webgl.disable(this.webgl.CULL_FACE);
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
        this.lightSpaceMatrixUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "lightSpaceMatrix"
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

        this.objectTextureUniform = new TextureUniform(
            this.webgl,
            this.program,
            "objectTexture",
            0,
            this.webgl.TEXTURE0
        );

        this.pointLightDataTextureUniform = new TextureUniform(
            this.webgl,
            this.program,
            "pointLightsDataTexture",
            1,
            this.webgl.TEXTURE1
        );

        this.pointLightNum = new Uniform1f(
            this.webgl,
            this.program,
            "pointLightsCount"
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
        this.shadowMapTextureUniform = new TextureUniform(
            this.webgl,
            this.program,
            "shadowMap",
            3,
            this.webgl.TEXTURE3
        );
        this.shadowAtlasTextureUniform = new TextureUniform(
            this.webgl,
            this.program,
            "shadowAtlas",
            4,
            this.webgl.TEXTURE4
        );
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
        colorFactor,
        objectTexture,
        scene,
        useLight,
        cameraPosition,
        bonesDataTexture,
        shadowMapTexture,
        shadowAtlasTexture,
        bonesCount,
    }: {
        useTexture: boolean;
        useBones: boolean;
        indices: Uint16Array;
        vertices: Float32Array;
        joints: Float32Array;
        weights: Float32Array;
        normals: Float32Array;
        textureCoords: Float32Array;
        scene: Scene;
        modelMatrix: mat4;
        normalMatrix: mat3;
        objectTexture: ImageTexture | null;
        bonesDataTexture: DataTexture | null;
        shadowMapTexture: DataTexture;
        shadowAtlasTexture: DataTexture;
        bonesCount: number;
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

        const ambientLight = scene.getAmbientLight();
        this.ambientLightBrightUniform.setData(ambientLight.getBright());
        this.ambientLightColorUniform.setData(
            new Float32Array(ambientLight.getColor())
        );

        const directionalLight = scene.getDirectionalLight();
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

        this.colorFactorUniform.setData(colorFactor);

        this.transformationMatrix.setData(modelMatrix);
        this.normalMatUniform.setData(normalMatrix);

        this.objectTextureUniform.setData(objectTexture?.getTexture() ?? null);
        this.pointLightDataTextureUniform.setData(
            scene._getPointLightsDataTexture()?.getTexture() ?? null
        );
        this.pointLightNum.setData(scene.getPointLights().length);

        this.bonesDataTextureUniform.setData(
            bonesDataTexture?.getTexture() ?? null
        );
        this.bonesCountUniform.setData(bonesCount);
        this.lightSpaceMatrixUniform.setData(directionalLight.getLightMatrix());
        this.shadowMapTextureUniform.setData(shadowMapTexture.getTexture());
        this.shadowAtlasTextureUniform.setData(shadowAtlasTexture.getTexture());
    }
}
