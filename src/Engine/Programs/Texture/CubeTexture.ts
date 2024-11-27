import { Texture } from "./Texture";

export class CubeTexture extends Texture {
    public update() {}

    public setData(width: number, height: number) {
        this.bind();

        for (let i = 0; i < 6; i++) {
            this.webgl.texImage2D(
                this.webgl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                this.webgl.DEPTH_COMPONENT32F,
                width,
                height,
                0,
                this.webgl.DEPTH_COMPONENT,
                this.webgl.FLOAT,
                null
            );
        }

        this.webgl.texParameteri(
            this.webgl.TEXTURE_CUBE_MAP,
            this.webgl.TEXTURE_MIN_FILTER,
            this.webgl.NEAREST
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_CUBE_MAP,
            this.webgl.TEXTURE_MAG_FILTER,
            this.webgl.NEAREST
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_CUBE_MAP,
            this.webgl.TEXTURE_WRAP_S,
            this.webgl.CLAMP_TO_EDGE
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_CUBE_MAP,
            this.webgl.TEXTURE_WRAP_T,
            this.webgl.CLAMP_TO_EDGE
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_CUBE_MAP,
            this.webgl.TEXTURE_WRAP_R,
            this.webgl.CLAMP_TO_EDGE
        );

        this.unbind();
    }

    protected bind() {
        this.webgl.bindTexture(this.webgl.TEXTURE_CUBE_MAP, this.texture);
    }

    protected unbind() {
        this.webgl.bindTexture(this.webgl.TEXTURE_CUBE_MAP, null);
    }
}
