import { mat3, mat4, vec4 } from "gl-matrix";
import { vertex } from "./shaders/vertex";
import { fragment } from "./shaders/fragment";
import { Scene } from "engine/Scene";
import { Material } from "engine/Material";
import { Program } from "engine/Programs/Program";
import { EngineObject } from "engine/EngineObject";
import { MeshPrimitive } from "engine/MeshPrimitive";
import { Uniform1i } from "engine/Programs/Uniform/Uniform1i";
import { Uniform1f } from "engine/Programs/Uniform/Uniform1f";
import { Uniform3fv } from "engine/Programs/Uniform/Uniform3fv";
import { Uniform4fv } from "engine/Programs/Uniform/Uniform4fv";
import { ArrayBuffer } from "engine/Programs/Buffer/ArrayBuffer";
import { DataTexture } from "engine/Programs/Texture/DataTexture";
import { ImageTexture } from "engine/Programs/Texture/ImageTexture";
import { ElementBuffer } from "engine/Programs/Buffer/ElementBuffer";
import { TextureUniform } from "engine/Programs/Uniform/TextureUniform";
import { UniformMatrix4fv } from "engine/Programs/Uniform/UniformMatrix4fv";

export class TriangleProgram extends Program {
    private indicesBuffer: ElementBuffer;
    private vertexBuffer: ArrayBuffer;
    private textureCoordsBuffer: ArrayBuffer;
    private weightsBuffer: ArrayBuffer;
    private bonesIndexesBuffer: ArrayBuffer;

    private useTextureUniform: Uniform1i;
    private useBonesUniform: Uniform1i;

    private objectTextureUniform: TextureUniform;

    private bonesDataTextureUniform: TextureUniform;
    private bonesCountUniform: Uniform1f;

    private cameraPositionUniform: Uniform3fv;

    private colorFactorUniform: Uniform4fv;
    private alphaCutoffUniform: Uniform1f;

    private transformationMatrix: UniformMatrix4fv;
    private viewMatUniform: UniformMatrix4fv;
    private projectionMatUniform: UniformMatrix4fv;

    constructor(webgl: WebGL2RenderingContext) {
        super(webgl);
        this.Init(vertex, fragment);
        super.useProgram();
        this.initBuffers();
        this.matrixInit();
    }

    public setVariables(
        parameters: Parameters<typeof this.setVertexShaderBuffers>[0]
    ) {
        this.setVertexShaderBuffers(parameters);
    }

    public draw(width: number, height: number, scene: Scene) {
        this.useProgram();
        this.bind(width, height);

        const camera = scene.getCamera();
        const objects = scene.getObjects();

        this.updateView(camera.getView());

        objects.forEach((object) => {
            this.objectDraw(scene, object);
        });
    }

    private objectDraw(scene: Scene, object: EngineObject) {
        if (object.isSingleFace()) {
            this.disableCullFace();
        } else {
            this.enableCullFace();
        }

        object.getMeshes().forEach((mesh) => {
            const isLight = Boolean(mesh.getLight());
            const primitives = mesh.getPrimitives();
            const skeleton = mesh.getSkeleton();
            const boneMatrices = skeleton?.getSkinningMatrices();
            const useBones = !!boneMatrices;

            const modelMatrix = object.getMeshModelMatrix(mesh);
            const normalMatrix = object.getMeshNormalMatrix(mesh);

            primitives.forEach((primitive) => {
                const material = primitive.getMaterial();

                this.setVariables({
                    primitive,
                    material,
                    useBones,
                    scene,
                    modelMatrix,
                    normalMatrix,
                    bonesDataTexture: skeleton?.getBonesDataTexture() ?? null,
                    bonesCount: skeleton?.getBonesCount() ?? 0,

                    useLight: !isLight,
                    colorFactor: material.getColor(),
                    objectTexture: material.getBaseTexture(),
                    cameraPosition: new Float32Array(
                        scene.getCamera().getTransform().getPosition()
                    ),
                });

                this.webgl.drawElements(
                    this.webgl.TRIANGLES,
                    primitive.getIndices().length,
                    this.webgl.UNSIGNED_SHORT,
                    0
                );
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

    private matrixInit() {
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

        this.useTextureUniform = new Uniform1i(
            this.webgl,
            this.program,
            "useTexture"
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

        this.projectionMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "projection"
        );

        this.useBonesUniform = new Uniform1i(
            this.webgl,
            this.program,
            "useBones"
        );

        this.objectTextureUniform = new TextureUniform(
            this.webgl,
            this.program,
            "objectTexture",
            0,
            this.webgl.TEXTURE0
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

        this.alphaCutoffUniform = new Uniform1f(
            this.webgl,
            this.program,
            "alphaCutoff"
        );
    }

    private setVertexShaderBuffers({
        useBones,
        modelMatrix,
        normalMatrix,
        colorFactor,
        objectTexture,
        scene,
        useLight,
        cameraPosition,
        bonesDataTexture,
        bonesCount,
        material,
        primitive,
    }: {
        useBones: boolean;
        primitive: MeshPrimitive;
        scene: Scene;
        material: Material;
        modelMatrix: mat4;
        normalMatrix: mat3;
        objectTexture: ImageTexture | null;
        bonesDataTexture: DataTexture | null;
        bonesCount: number;
        colorFactor: vec4;
        cameraPosition: Float32Array;
        useLight: boolean;
    }) {
        const camera = scene.getCamera();

        this.viewMatUniform.setData(camera.getView());
        this.projectionMatUniform.setData(camera.getProjection());

        this.indicesBuffer.setBufferData(primitive.getIndices());

        this.vertexBuffer.setBufferData(primitive.getVertices());
        this.textureCoordsBuffer.setBufferData(primitive.getTextureCoords());
        this.weightsBuffer.setBufferData(primitive.getWeights());
        this.bonesIndexesBuffer.setBufferData(primitive.getJoints());

        const useTexture = Boolean(material.getBaseTexture());

        this.useBonesUniform.setData(Number(useBones));
        this.useTextureUniform.setData(Number(useTexture));

        this.alphaCutoffUniform.setData(material.getAlphaCutoff());

        this.cameraPositionUniform.setData(cameraPosition);

        this.colorFactorUniform.setData(colorFactor);

        this.transformationMatrix.setData(modelMatrix);

        this.objectTextureUniform.setData(objectTexture?.getTexture() ?? null);

        this.bonesDataTextureUniform.setData(
            bonesDataTexture?.getTexture() ?? null
        );
        this.bonesCountUniform.setData(bonesCount);
    }
}
