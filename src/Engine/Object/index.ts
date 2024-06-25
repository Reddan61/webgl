import { mat4, vec3 } from "gl-matrix";
import { loadImage } from '../Utils/Utils';

export class Object {
    constructor(
        position: vec3, 
        vertices: number[], 
        indices: number[], 
        textureCoords: number[], 
        normals: number[],
        textureURL: string
    ) {
        this.position = position;
        this.vertices = vertices;
        this.indices = indices;
        this.textureCoords = textureCoords;
        this.normals = normals;
        this.textureURL = textureURL;


        this.translation = new Float32Array(16);
        mat4.fromTranslation(this.translation, this.position);
    }

    public async init() {
        // const vertexBuffer = webgl.createBuffer();
        // webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
        // webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(this.vertices), webgl.STATIC_DRAW);
        
        // const textureCoordsBuffer = webgl.createBuffer();
        // webgl.bindBuffer(webgl.ARRAY_BUFFER, textureCoordsBuffer);
        // webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(this.textureCoords), webgl.STATIC_DRAW);

        // const normalsBuffer = webgl.createBuffer();
        // webgl.bindBuffer(webgl.ARRAY_BUFFER, normalsBuffer);
        // webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(this.normals), webgl.STATIC_DRAW);

        // const indicesBuffer = webgl.createBuffer();
        // webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        // webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), webgl.STATIC_DRAW);

        // webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
        // const vertexAttributeLocation = webgl.getAttribLocation(program, "vertexPosition");
        // webgl.vertexAttribPointer(
        //     vertexAttributeLocation, 
        //     3,
        //     webgl.FLOAT, false, 
        //     3 * Float32Array.BYTES_PER_ELEMENT, 
        //     0
        // );
        // webgl.enableVertexAttribArray(vertexAttributeLocation);

        // webgl.bindBuffer(webgl.ARRAY_BUFFER, normalsBuffer);
        // const normalsAttributeLocation = webgl.getAttribLocation(program, "normals");
        // webgl.vertexAttribPointer(
        //     normalsAttributeLocation, 
        //     3,
        //     webgl.FLOAT, true, 
        //     3 * Float32Array.BYTES_PER_ELEMENT, 
        //     0
        // );
        // webgl.enableVertexAttribArray(normalsAttributeLocation);

        // webgl.bindBuffer(webgl.ARRAY_BUFFER, textureCoordsBuffer);
        // const vertexTextureLocation = webgl.getAttribLocation(program, "textureCoords");
        // webgl.vertexAttribPointer(
        //     vertexTextureLocation, 
        //     2,
        //     webgl.FLOAT, false, 
        //     2 * Float32Array.BYTES_PER_ELEMENT, 
        //     0
        // );
        // webgl.enableVertexAttribArray(vertexTextureLocation);

        // this.texture = webgl.createTexture();
        // webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
        // webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
        // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
        // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
        // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
        // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
        this.image = await loadImage(this.textureURL);
        // webgl.texImage2D(
        //     webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA,
        //     webgl.UNSIGNED_BYTE,
        //     image
        // );
        // webgl.bindTexture(webgl.TEXTURE_2D, null);
    }

    public draw(webgl: WebGLRenderingContext, transformationLocation: WebGLUniformLocation) {
	    // webgl.uniformMatrix4fv(transformationLocation, false, this.translation);

        // webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
        // webgl.activeTexture(webgl.TEXTURE0);
    
        // webgl.drawElements(webgl.TRIANGLES, this.indices.length, webgl.UNSIGNED_SHORT, 0);
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

    public getMatrix() {
        return this.translation;
    }

    public getImage() {
        return this.image;
    }

    private position: vec3 = null;
    private vertices: number[] = null;
    private indices: number[] = null;
    private textureCoords: number[] = null;
    private normals: number[] = null;
    private textureURL: string = null;
    private image: HTMLImageElement = null;
    // private texture: WebGLTexture = null;
    private translation: mat4 = null;

}