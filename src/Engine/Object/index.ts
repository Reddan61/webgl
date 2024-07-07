import { mat4, vec3 } from "gl-matrix";

export class Object {
    constructor(
        vertices: number[], 
        indices: number[], 
        textureCoords: number[], 
        normals: number[],
        position: vec3,
        image: HTMLImageElement
    ) {
        this.position = position;
        this.vertices = vertices;
        this.indices = indices;
        this.textureCoords = textureCoords;
        this.normals = normals;
        this.image = image;

        mat4.fromTranslation(this.translation, this.position);
    }

    public getMatrix() {
        return this.matrix;
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
    
    public update() {
        this.angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	    const identity = new Float32Array(16);
	    mat4.identity(identity);

	    mat4.rotate(this.yRotation, identity, this.angle, [0, 1, 0]);
	    mat4.rotate(this.xRotation, identity, this.angle, [1, 0, 0]);
	    mat4.mul(this.rotation, this.xRotation, this.yRotation);
        mat4.mul(this.matrix, this.translation, this.rotation);
    }

    private position: vec3 = null;
    private vertices: number[] = null;
    private indices: number[] = null;
    private textureCoords: number[] = null;
    private normals: number[] = null;
    private image: HTMLImageElement = null;
    private translation: mat4 = new Float32Array(16);
    private rotation: mat4 = new Float32Array(16); 
    private matrix:  mat4 = new Float32Array(16);
    private xRotation: mat4 = new Float32Array(16); 
    private yRotation: mat4 = new Float32Array(16); 
    private angle = 0;
}