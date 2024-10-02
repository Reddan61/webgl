import { Uniform1i } from "./Uniform1i";

export class TextureUniform extends Uniform1i {
    private positionNum: number;
    private textureShaderPos: GLenum;

    constructor(
        webgl: WebGL2RenderingContext,
        program: WebGLProgram,
        name: string,
        positionNum: number,
        textureShaderPos: GLenum
    ) {
        super(webgl, program, name);
        this.positionNum = positionNum;
        this.textureShaderPos = textureShaderPos;
    }

    public setData(texture: WebGLTexture | null) {
        this.webgl.activeTexture(this.textureShaderPos);
        this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
        super.setData(this.positionNum);
    }
}
