import { vec4 } from "gl-matrix";
import { ImageTexture } from "../Programs/Texture/ImageTexture";

export class Material {
    private color: vec4;
    private image: HTMLImageElement | null = null;
    private texture: ImageTexture | null = null;

    constructor(
        color: vec4 = [1, 1, 1, 1],
        image: HTMLImageElement | null = null
    ) {
        this.color = color;
        this.image = image;
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
