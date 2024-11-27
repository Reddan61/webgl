import { Texture } from "./Texture";

export class DataTexture extends Texture {
    public update(data: Float32Array, width: number, height: number) {
        this.setData(data, width, height);
    }

    public setData(
        data: Float32Array | null,
        width: number,
        height: number,
        internalformat: GLint = this.webgl.RGBA32F,
        format: GLenum = this.webgl.RGBA,
        type: GLenum = this.webgl.FLOAT
    ) {
        this.bind();
        this.webgl.texImage2D(
            this.webgl.TEXTURE_2D,
            0,
            internalformat,
            width,
            height,
            0,
            format,
            type,
            data
        );

        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_WRAP_S,
            this.webgl.CLAMP_TO_EDGE
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_WRAP_T,
            this.webgl.CLAMP_TO_EDGE
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_MIN_FILTER,
            this.webgl.NEAREST
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_MAG_FILTER,
            this.webgl.NEAREST
        );

        this.unbind();
    }
}
