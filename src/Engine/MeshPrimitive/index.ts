import { vec2, vec3, vec4 } from "gl-matrix";
import { AABB } from "../AABB";
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
    tangents?: number[] | null;
}

export interface MaterialConstructor {
    colorFactor: vec4;
    baseImage: HTMLImageElement | null;
}

export class MeshPrimitive {
    private indices: Uint16Array;
    private vertices: Float32Array;
    private textureCoords: Float32Array;
    private normals: Float32Array;
    private weight: Float32Array;
    private joints: Float32Array;
    private tangents: Float32Array;

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
            tangents,
        }: MeshPrimitiveConstructor,
        material = new Material({})
    ) {
        this.vertices = new Float32Array(vertices.data);
        this.indices = new Uint16Array(indices);
        this.normals = new Float32Array(normals);
        this.textureCoords = new Float32Array(
            textureCoords.length == 0
                ? this.generateDataForVertexLength(vertices.data, 2)
                : textureCoords
        );
        this.weight = new Float32Array(
            weight ?? this.generateDataForVertexLength(vertices.data)
        );
        this.joints = new Float32Array(
            joints ?? this.generateDataForVertexLength(vertices.data)
        );

        this.tangents = new Float32Array(
            tangents ?? this.generateDataForVertexLength(vertices.data)
        );

        this.material = material;
        this.aabb = new AABB(vertices.max as vec3, vertices.min as vec3);
    }

    private generateDataForVertexLength(
        vertices: number[],
        newLengthPerElement = 4
    ) {
        const verticesLength = vertices.length / 3;
        const newLength = verticesLength * newLengthPerElement;
        const result = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            result[i] = 1;
        }

        return result;
    }

    private computeTangent(
        v0: vec3,
        v1: vec3,
        v2: vec3,
        uv0: vec2,
        uv1: vec2,
        uv2: vec2
    ) {
        let edge1 = vec3.create();
        let edge2 = vec3.create();
        vec3.sub(edge1, v1, v0);
        vec3.sub(edge2, v2, v0);

        let deltaUV1 = [uv1[0] - uv0[0], uv1[1] - uv0[1]];
        let deltaUV2 = [uv2[0] - uv0[0], uv2[1] - uv0[1]];

        let f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV1[1] * deltaUV2[0]);

        let tangent = vec3.fromValues(
            f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]),
            f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]),
            f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2])
        );

        vec3.normalize(tangent, tangent);

        return tangent;
    }

    private calculateTangentsNormalTexture() {
        if (!this.material.getNormalTexture()) {
            this.tangents = new Float32Array(this.vertices.length);

            return null;
        }

        const tangents = Array(this.vertices.length / 3).fill(vec3.create());

        for (let i = 0; i < this.indices.length; i += 3) {
            const i0 = this.indices[i];
            const i1 = this.indices[i + 1];
            const i2 = this.indices[i + 2];

            const v0 = this.vertices.slice(i0 * 3, i0 * 3 + 3);
            const v1 = this.vertices.slice(i1 * 3, i1 * 3 + 3);
            const v2 = this.vertices.slice(i2 * 3, i2 * 3 + 3);

            const uv0 = this.textureCoords.slice(i0 * 2, i0 * 2 + 2);
            const uv1 = this.textureCoords.slice(i1 * 2, i1 * 2 + 2);
            const uv2 = this.textureCoords.slice(i2 * 2, i2 * 2 + 2);

            const tangent = this.computeTangent(v0, v1, v2, uv0, uv1, uv2);

            vec3.add(tangents[i0], tangents[i0], tangent);
            vec3.add(tangents[i1], tangents[i1], tangent);
            vec3.add(tangents[i2], tangents[i2], tangent);
        }

        const result = new Float32Array(tangents.length * 3);

        for (let i = 0; i < tangents.length; i++) {
            vec3.normalize(tangents[i], tangents[i]);
            const index = i * 3;
            result[index] = tangents[i][0];
            result[index + 1] = tangents[i][1];
            result[index + 2] = tangents[i][2];
        }

        this.tangents = result;
    }

    public getTangents() {
        return this.tangents;
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.material._setWebGl(webgl);
        // this.calculateTangentsNormalTexture();
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

        // this.calculateTangentsNormalTexture();
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
