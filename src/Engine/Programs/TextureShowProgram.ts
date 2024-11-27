import { CubeTextureFragment } from "../shaders/cubeTexture/fragment";
import { CubeTextureVertex } from "../shaders/cubeTexture/vertex";
import { ArrayBuffer } from "./Buffer/ArrayBuffer";
import { Program } from "./Program";
import { TextureUniform } from "./Uniform/TextureUniform";

export class TextureShowProgram extends Program {
    private vertexBuffer: ArrayBuffer;
    private textureCoordsBuffer: ArrayBuffer;
    private cubeTexureUniform: TextureUniform;

    // prettier-ignore
    private vertices = new Float32Array([
        // X, Y
        -1, -1,      // нижний левый угол
        1, -1,      // нижний правый угол
        -1,  1,     // верхний левый угол

        1, -1,      // нижний правый угол
        1,  1,      // верхний правый угол
        -1,  1,     // верхний левый угол
    ]);

    // prettier-ignore
    private textureCoords = new Float32Array([
        // U, V
        0.0, 0.0,  // нижний левый угол
        1.0, 0.0,  // нижний правый угол
        0.0, 1.0,  // верхний левый угол

        1.0, 0.0,  // нижний правый угол
        1.0, 1.0,  // верхний правый угол
        0.0, 1.0   // верхний левый угол
    ])

    constructor(webgl: WebGL2RenderingContext) {
        super(webgl);

        this.Init(CubeTextureVertex, CubeTextureFragment);
        super.useProgram();
        this.initBuffers();
    }

    public useProgram() {
        super.useProgram();
        this.setAttributes();
    }

    public draw({
        width,
        height,
        texture,
    }: {
        width: number;
        height: number;
        texture: WebGLTexture;
    }) {
        this.useProgram();
        this.bind(width, height);

        this.vertexBuffer.setBufferData(this.vertices);
        this.textureCoordsBuffer.setBufferData(this.textureCoords);

        this.cubeTexureUniform.setData(texture);

        this.webgl.drawArrays(
            this.webgl.TRIANGLES,
            0,
            this.vertices.length / 2
        );
    }

    private bind(width: number, height: number) {
        this.webgl.viewport(0, 0, width, height);
        this.webgl.clear(
            this.webgl.DEPTH_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );
    }

    private initBuffers() {
        this.vertexBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "vertexPosition",
            2,
            this.webgl.FLOAT
        );

        this.textureCoordsBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "textureCoords",
            2,
            this.webgl.FLOAT
        );

        this.cubeTexureUniform = new TextureUniform(
            this.webgl,
            this.program,
            "customTexture",
            0,
            this.webgl.TEXTURE0
        );
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
        this.textureCoordsBuffer.setAttributes();
    }
}
