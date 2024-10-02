export class Texture {
    protected webgl: WebGL2RenderingContext;
    protected texture: WebGLTexture;

    constructor(webgl: WebGL2RenderingContext) {
        this.webgl = webgl;

        this.texture = this.webgl.createTexture() as WebGLTexture;
    }

    public getTexture() {
        return this.texture;
    }

    protected bind() {
        this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.texture);
    }

    protected unbind() {
        this.webgl.bindTexture(this.webgl.TEXTURE_2D, null);
    }
}
