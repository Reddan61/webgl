import { ArrayBuffer } from "./Buffer/ArrayBuffer";
import { Program } from "./Program";
import { UniformMatrix4fv } from "./Uniform/UniformMatrix4fv";
import { ElementBuffer } from "./Buffer/ElementBuffer";
import { CubeTexture } from "./Texture/CubeTexture";
import { shadowVertexShader } from "../shaders/shadow/PointLight/vertex";
import { shadowFragmentShader } from "../shaders/shadow/PointLight/fragment";
import { Uniform3fv } from "./Uniform/Uniform3fv";
import { Uniform1f } from "./Uniform/Uniform1f";
import { PointLight } from "../Light/PointLight";
import { Scene } from "../Scene";
import { mat4, vec2 } from "gl-matrix";
import { DataTexture } from "./Texture/DataTexture";

export class ShadowAtlasProgram extends Program {
    private SHADOW_MAP_WIDTH = 2048;
    private SHADOW_MAP_HEIGHT = 2048;

    private shadowMapTexture: DataTexture;
    private shadowFrameBuffer: WebGLFramebuffer;

    private vertexBuffer: ArrayBuffer;
    private indicesBuffer: ElementBuffer;

    private farPlaneUniform: Uniform1f;
    private lightPositionUniform: Uniform3fv;
    private viewMatrixUniform: UniformMatrix4fv;
    private projMatrixUniform: UniformMatrix4fv;
    private modelMatrixUniform: UniformMatrix4fv;

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

        this.Init(shadowVertexShader, shadowFragmentShader);
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

        // 6 граней (cubeTexture)
        const numCols = 6;
        const numRows = pointLights.length;

        const atlasSizePerElementX = this.SHADOW_MAP_WIDTH / numCols;
        const atlasSizePerElementY = this.SHADOW_MAP_HEIGHT / numRows;

        const atlasScaleX = atlasSizePerElementX / this.SHADOW_MAP_WIDTH;
        const atlasScaleY = atlasSizePerElementY / this.SHADOW_MAP_HEIGHT;

        this.useProgram();
        this.bind();

        for (let i = 0; i < 6; i++) {
            pointLights.forEach((light, lightIndex) => {
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
                    object.getMeshes().forEach((mesh) => {
                        if (mesh.getLight()) {
                            return null;
                        }

                        mesh.getPrimitives().forEach((prim) => {
                            this.setVariables({
                                index: i,
                                indices: prim.getIndices(),
                                modelMatrix: object.getModelMatrix(),
                                pointLight: light,
                                vertices: prim.getVertices(),
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
        modelMatrix,
        pointLight,
        index,
    }: {
        indices: Uint16Array;
        vertices: Float32Array;
        modelMatrix: mat4;
        pointLight: PointLight;
        index: number;
    }) {
        this.indicesBuffer.setBufferData(indices);
        this.vertexBuffer.setBufferData(vertices);

        this.farPlaneUniform.setData(pointLight.getFarPlane());
        this.viewMatrixUniform.setData(pointLight.getLightMatrices()[index]);
        this.projMatrixUniform.setData(pointLight.getProjMatrix());
        this.modelMatrixUniform.setData(modelMatrix);
        this.lightPositionUniform.setData(
            new Float32Array(pointLight.getPosition())
        );
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
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
    }
}
