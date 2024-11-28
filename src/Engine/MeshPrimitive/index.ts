import { vec3, vec4 } from "gl-matrix";
import { AABB } from "../AABB";
import { ImageTexture } from "../Programs/Texture/ImageTexture";
import { Material } from "../Material";

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
    baseTexture: ImageTexture | null;
}

export class MeshPrimitive {
    private indices: Uint16Array;
    private vertices: Float32Array;
    private textureCoords: Float32Array;
    private normals: Float32Array;
    private weight: Float32Array;
    private joints: Float32Array;

    private material: Material;

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
        material = new Material()
    ) {
        this.vertices = new Float32Array(vertices.data);
        this.indices = new Uint16Array(indices);
        this.normals = new Float32Array(normals);
        this.textureCoords = new Float32Array(textureCoords);
        this.weight = new Float32Array(
            weight ?? this.generateDataForVertexLength(vertices.data)
        );
        this.joints = new Float32Array(
            joints ?? this.generateDataForVertexLength(vertices.data)
        );

        this.material = material;

        this.aabb = new AABB(vertices.max as vec3, vertices.min as vec3);
    }

    private generateDataForVertexLength(vertices: number[]) {
        const verticesLength = vertices.length / 3;
        const newLength = verticesLength * 4;
        const result = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            result[i] = 1;
        }

        return result;
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

    public setMaterial(material: Material) {
        this.material = material;
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
