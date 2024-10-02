import { Texture } from "./Texture";

export class ImageTexture extends Texture {
    constructor(
        webgl: WebGL2RenderingContext,
        image: HTMLImageElement,
        flipY: boolean
    ) {
        super(webgl);

        this.setData(image, flipY);
    }

    private setData(image: HTMLImageElement, flipY: boolean) {
        this.bind();

        this.webgl.pixelStorei(this.webgl.UNPACK_FLIP_Y_WEBGL, flipY);
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
            this.webgl.LINEAR
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_MAG_FILTER,
            this.webgl.LINEAR
        );

        this.webgl.texImage2D(
            this.webgl.TEXTURE_2D,
            0,
            this.webgl.RGBA,
            this.webgl.RGBA,
            this.webgl.UNSIGNED_BYTE,
            image
        );

        this.unbind();
    }
}
