import { vec3 } from "gl-matrix";
import { Object } from "../Object";
import { loadImage } from "../Utils/Utils";

export class ObjectGroup {
    constructor(
        vertices: number[], 
        indices: number[], 
        textureCoords: number[], 
        normals: number[],
        textureURL: string
    ) {
        this.vertices = vertices;
        this.indices = indices;
        this.textureCoords = textureCoords;
        this.normals = normals;
        this.textureURL = textureURL;
    }

    public addObject(object: Object) {
        this.objects.push(object);
    }

    public update() {
        this.getObjects().forEach(object => object.update());
    }

    public getImage() {
        return this.image;
    }

    public getVertices() {
        return this.vertices;
    }

    public getNormals() {
        return this.normals;
    }

    public getTextureCoords() {
        return this.textureCoords;
    }

    public getIndices() {
        return this.indices;
    }

    public async init() {
        this.image = await loadImage(this.textureURL);
    }
    public getObjects() {
        return this.objects;
    }

    private vertices: number[] = null;
    private indices: number[] = null;
    private textureCoords: number[] = null;
    private normals: number[] = null;
    private textureURL: string = null;
    private image: HTMLImageElement = null;
    private objects: Object[] = [];
}