import { vec4 } from "gl-matrix";
import { ImageTexture } from "../Programs/Texture/ImageTexture";

export enum MATERIAL_ALPHA_MODE {
    OPAQUE = "OPAQUE",
    MASK = "MASK",
    BLEND = "BLEND",
}

export class Material {
    private color: vec4;
    private image: HTMLImageElement | null = null;
    private texture: ImageTexture | null = null;
    private alphaMode = MATERIAL_ALPHA_MODE.OPAQUE;
    private alphaCutoff = 0.5;

    constructor({
        color = [1, 1, 1, 1],
        image = null,
        alphaMode = MATERIAL_ALPHA_MODE.OPAQUE,
        alphaCutoff = 0.5,
    }: {
        color?: vec4;
        image?: HTMLImageElement | null;
        alphaMode?: MATERIAL_ALPHA_MODE;
        alphaCutoff?: number;
    }) {
        this.color = color;
        this.image = image;
        this.alphaMode = alphaMode;
        this.alphaCutoff = alphaCutoff;
    }

    public getAlphaMode() {
        return this.alphaMode;
    }

    public getAlphaCutoff() {
        if (this.alphaMode !== MATERIAL_ALPHA_MODE.OPAQUE)
            return this.alphaCutoff;

        return 0.0;
    }

    public setColor(color: vec4) {
        this.color = color;
    }

    public setImage(image: HTMLImageElement | null) {
        this.image = image;
    }

    public getImage() {
        return this.image;
    }

    public setTexture(texture: ImageTexture | null) {
        this.texture = texture;
    }

    public getTexture() {
        return this.texture;
    }

    public getColor() {
        return this.color;
    }
}
