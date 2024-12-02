import { vec4 } from "gl-matrix";
import { ImageTexture } from "../Programs/Texture/ImageTexture";

export enum MATERIAL_ALPHA_MODE {
    OPAQUE = "OPAQUE",
    MASK = "MASK",
    BLEND = "BLEND",
}

export class Material {
    private color: vec4;
    private baseImage: HTMLImageElement | null = null;
    private normalImage: HTMLImageElement | null = null;
    private isFlipTexture = false;
    private baseTexture: ImageTexture | null = null;
    private normalTexture: ImageTexture | null = null;
    private alphaMode = MATERIAL_ALPHA_MODE.OPAQUE;
    private alphaCutoff = 0.5;

    constructor({
        color = [1, 1, 1, 1],
        baseImage = null,
        alphaMode = MATERIAL_ALPHA_MODE.OPAQUE,
        alphaCutoff = 0.5,
        normalImage = null,
        isFlipTexture = false,
    }: {
        color?: vec4;
        baseImage?: HTMLImageElement | null;
        normalImage?: HTMLImageElement | null;
        alphaMode?: MATERIAL_ALPHA_MODE;
        alphaCutoff?: number;
        isFlipTexture?: boolean;
    }) {
        this.color = color;
        this.baseImage = baseImage;
        this.alphaMode = alphaMode;
        this.alphaCutoff = alphaCutoff;
        this.normalImage = normalImage;
        this.isFlipTexture = isFlipTexture;
    }

    public getAlphaMode() {
        return this.alphaMode;
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.createTexture(webgl);
    }

    public getNormalTexture() {
        return this.normalTexture;
    }

    public getAlphaCutoff() {
        if (this.alphaMode !== MATERIAL_ALPHA_MODE.OPAQUE)
            return this.alphaCutoff;

        return 0.0;
    }

    public setColor(color: vec4) {
        this.color = color;
    }

    public setBaseImage(image: HTMLImageElement | null) {
        this.baseImage = image;
    }

    public getBaseImage() {
        return this.baseImage;
    }

    public setBaseTexture(texture: ImageTexture | null) {
        this.baseTexture = texture;
    }

    public getBaseTexture() {
        return this.baseTexture;
    }

    public getColor() {
        return this.color;
    }

    private createTexture(webgl: WebGL2RenderingContext) {
        if (this.baseImage) {
            this.baseTexture = new ImageTexture(
                webgl,
                this.baseImage,
                this.isFlipTexture
            );
        }

        if (this.normalImage) {
            this.normalTexture = new ImageTexture(
                webgl,
                this.normalImage,
                false
            );
        }
    }
}
