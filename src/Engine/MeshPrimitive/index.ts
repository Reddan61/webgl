import { vec4 } from "gl-matrix";
import { AABB } from "../AABB";

export interface MeshPrimitiveConstructor {
    vertices: {
        data: number[];
        max: number[];
        min: number[];
    };
    indices: number[];
    textureCoords: number[];
    normals: number[];
    weight?: number[] | null;
    joints?: number[] | null;
}

export interface MaterialConstructor {
    colorFactor: vec4;
    baseImage: HTMLImageElement | null;
}

interface MeshPrimitiveMaterial {
    colorFactor: vec4;
    baseImage: HTMLImageElement | null;
    baseTexture: WebGLTexture | null;
}

export class MeshPrimitive {
    private indices: Uint16Array;
    private vertices: Float32Array;
    private textureCoords: Float32Array;
    private normals: Float32Array;
    private weight: Float32Array;
    private joints: Float32Array;

    private material: MeshPrimitiveMaterial;

    private aabb: AABB;

    constructor(
        {
            indices,
            normals,
            textureCoords,
            vertices,
            joints,
            weight,
        }: MeshPrimitiveConstructor,
        { baseImage, colorFactor }: MaterialConstructor
    ) {
        this.vertices = new Float32Array(vertices.data);
        this.indices = new Uint16Array(indices);
        this.normals = new Float32Array(normals);
        this.textureCoords = new Float32Array(textureCoords);
        this.weight = new Float32Array(weight ?? []);
        this.joints = new Float32Array(joints ?? []);

        this.material = {
            baseImage,
            colorFactor,
            baseTexture: null,
        };

        this.aabb = new AABB(vertices.max, vertices.min);
    }

    public getTextureCoords() {
        return this.textureCoords;
    }

    public getNormals() {
        return this.normals;
    }

    public getMaterial() {
        return this.material;
    }

    public setTexture(texture: WebGLTexture | null) {
        this.material.baseTexture = texture;
    }

    public getIndices() {
        return this.indices;
    }

    public getWeights() {
        return this.weight;
    }

    public getJoints() {
        return this.joints;
    }

    public getVertices() {
        return this.vertices;
    }

    public getAABB() {
        return this.aabb;
    }
}