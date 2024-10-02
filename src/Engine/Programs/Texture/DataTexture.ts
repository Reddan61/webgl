import { Texture } from "./Texture";

export class DataTexture extends Texture {
    constructor(webgl: WebGL2RenderingContext) {
        super(webgl);
    }

    public update(data: Float32Array, width: number, height: number) {
        this.setData(data, width, height);
    }

    public setData(data: Float32Array, width: number, height: number) {
        this.bind();
        this.webgl.texImage2D(
            this.webgl.TEXTURE_2D,
            0,
            this.webgl.RGBA32F,
            width,
            height,
            0,
            this.webgl.RGBA,
            this.webgl.FLOAT,
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
