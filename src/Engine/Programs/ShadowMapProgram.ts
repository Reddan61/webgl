import { mat4, vec3 } from "gl-matrix";
import { DirectionalLight } from "../Light/DirectionalLight";
import { shadowFragmentShader } from "../shaders/shadow/DirectionalLight/fragment";
import { shadowVertexShader } from "../shaders/shadow/DirectionalLight/vertex";
import { ArrayBuffer } from "./Buffer/ArrayBuffer";
import { Program } from "./Program";
import { DataTexture } from "./Texture/DataTexture";
import { UniformMatrix4fv } from "./Uniform/UniformMatrix4fv";
import { ElementBuffer } from "./Buffer/ElementBuffer";
import { Scene } from "../Scene";

export class ShadowMapProgram extends Program {
    private SHADOW_MAP_WIDTH = 2048;
    private SHADOW_MAP_HEIGHT = 2048;

    private shadowMapTexture: DataTexture;
    private shadowFrameBuffer: WebGLFramebuffer;

    private vertexBuffer: ArrayBuffer;
    private indicesBuffer: ElementBuffer;

    private lightSpaceMatrixUniform: UniformMatrix4fv;
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
        this.useProgram();
        this.bind();

        scene.getObjects().forEach((object) => {
            object.getMeshes().forEach((mesh) => {
                if (mesh.getLight()) return;

                mesh.getPrimitives().forEach((prim) => {
                    this.setVariables({
                        indices: prim.getIndices(),
                        directionalLight: scene.getDirectionalLight(),
                        modelMatrix: object.getModelMatrix(),
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
    }: {
        indices: Uint16Array;
        vertices: Float32Array;
        modelMatrix: mat4;
        directionalLight: DirectionalLight;
    }) {
        this.indicesBuffer.setBufferData(indices);
        this.vertexBuffer.setBufferData(vertices);

        this.lightSpaceMatrixUniform.setData(directionalLight.getLightMatrix());
        this.modelMatrixUniform.setData(modelMatrix);
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
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
    }
}
