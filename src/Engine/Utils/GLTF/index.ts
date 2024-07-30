import { vec4 } from "gl-matrix";
import { loadImage } from "../Utils";
import { ACCESSOR_TYPE, COMPONENT_TYPE, GLTF, GLTFScene } from "./types";

const TYPED_ARRAYS = {
    [COMPONENT_TYPE.BYTE]: Int8Array,
    [COMPONENT_TYPE.UNSIGNED_BYTE]: Uint8Array,
    [COMPONENT_TYPE.SHORT]: Int16Array,
    [COMPONENT_TYPE.UNSIGNED_SHORT]: Uint16Array,
    [COMPONENT_TYPE.UNSIGNED_INT]: Uint32Array,
    [COMPONENT_TYPE.FLOAT]: Float32Array,
};

const ACCESSOR_LENGTH: Record<ACCESSOR_TYPE, number> = {
    [ACCESSOR_TYPE.SCALAR]: 1,
    [ACCESSOR_TYPE.VEC2]: 2,
    [ACCESSOR_TYPE.VEC3]: 3,
    [ACCESSOR_TYPE.VEC4]: 4,
    [ACCESSOR_TYPE.MAT2]: 4,
    [ACCESSOR_TYPE.MAT3]: 9,
    [ACCESSOR_TYPE.MAT4]: 16,
};

interface ParsedGeometry {
    vertices: {
        data: number[];
        max: number[];
        min: number[];
    };
    normals: number[];
    textureCoords: number[];
    indices: number[];
}

interface ParsedMaterials {
    colorFactor: vec4;
    baseTexture: HTMLImageElement | null;
}

export interface GLTFParsedMesh {
    geometry: ParsedGeometry;
    materials: ParsedMaterials;
}

const readFromBuffer = (
    buffer: ArrayBuffer,
    count: number,
    byteOffset: number,
    byteStride: number,
    componentType: COMPONENT_TYPE,
    type: ACCESSOR_TYPE
) => {
    const result: number[] = [];
    const myTypedArray = TYPED_ARRAYS[componentType];
    const newByteStride = byteStride || myTypedArray.BYTES_PER_ELEMENT;

    for (let i = 0; i < count; i++) {
        let offset = byteOffset + newByteStride * i;

        const typedArray = new myTypedArray(
            buffer,
            offset,
            ACCESSOR_LENGTH[type]
        );

        result.push(...Array.from(typedArray));
    }

    return result;
};

const getAccessorData = (gltf: GLTF, buffers: ArrayBuffer[], index: number) => {
    const { accessors, bufferViews } = gltf;

    const {
        bufferView,
        componentType,
        byteOffset: byteOffsetAccessor = 0,
        count,
        max,
        min,
        type,
        normalized = false,
    } = accessors[index];

    const {
        buffer: bufferIndex,
        byteOffset: byteOffsetView = 0,
        byteStride = 0,
        target,
    } = bufferViews[bufferView as number];

    const buffer = buffers[bufferIndex];

    const bufferData = readFromBuffer(
        buffer,
        count,
        byteOffsetAccessor + byteOffsetView,
        byteStride,
        componentType,
        type
    );

    return {
        data: bufferData,
        max: max as number[],
        min: min as number[],
    };
};

const getImage = (
    gltf: GLTF,
    images: HTMLImageElement[],
    imageIndex: number
): HTMLImageElement | null => {
    return images[imageIndex];
};

const parseTexture = (
    gltf: GLTF,
    images: HTMLImageElement[],
    textureIndex: number
): HTMLImageElement | null => {
    const { textures } = gltf;
    const { source } = textures[textureIndex];

    if (source !== undefined) {
        return getImage(gltf, images, source);
    }

    return null;
};

interface ParseMaterial {
    colorFactor: vec4;
    texture: HTMLImageElement | null;
}

const parseMaterial = (
    gltf: GLTF,
    images: HTMLImageElement[],
    materialIndex: number
): ParseMaterial => {
    const { materials } = gltf;
    const { pbrMetallicRoughness } = materials[materialIndex];

    const result: ParseMaterial = {
        colorFactor: [1, 1, 1, 1],
        texture: null,
    };

    if (pbrMetallicRoughness) {
        const { baseColorTexture, baseColorFactor = [1, 1, 1, 1] } =
            pbrMetallicRoughness;

        result.colorFactor = baseColorFactor;

        if (baseColorTexture) {
            const { index } = baseColorTexture;
            result.texture = parseTexture(gltf, images, index);
        }
    }

    return result;
};

const parseMesh = (
    gltf: GLTF,
    buffers: ArrayBuffer[],
    images: HTMLImageElement[],
    meshIndex: number
): GLTFParsedMesh[] => {
    const { meshes } = gltf;

    const { primitives } = meshes[meshIndex];

    const result: GLTFParsedMesh[] = [];

    for (let i = 0; i < primitives.length; i++) {
        const {
            indices: indicesIndex,
            attributes,
            mode = 4,
            material,
        } = primitives[i];

        const materialResult: GLTFParsedMesh["materials"] = {
            colorFactor: [1, 1, 1, 1],
            baseTexture: null,
        };

        if (material !== undefined) {
            const materialParsed = parseMaterial(gltf, images, material);
            materialResult.baseTexture = materialParsed.texture;
            materialResult.colorFactor = materialParsed.colorFactor;
        }

        if (indicesIndex !== undefined) {
            const { NORMAL, POSITION, TEXCOORD_0 } = attributes;

            result.push({
                geometry: {
                    indices: getAccessorData(gltf, buffers, indicesIndex).data,
                    normals: getAccessorData(gltf, buffers, NORMAL).data,
                    textureCoords: getAccessorData(gltf, buffers, TEXCOORD_0)
                        .data,
                    vertices: getAccessorData(gltf, buffers, POSITION),
                },
                materials: materialResult,
            });
        }
    }

    return result;
};

const parseNodes = (
    gltf: GLTF,
    buffers: ArrayBuffer[],
    images: HTMLImageElement[],
    nodeIndex: number
): GLTFParsedMesh[] | null => {
    const { nodes } = gltf;
    const { mesh, children } = nodes[nodeIndex];

    if (mesh !== undefined) {
        return parseMesh(gltf, buffers, images, mesh);
    }

    if (children) {
        const result: GLTFParsedMesh[] = [];

        for (let i = 0; i < children.length; i++) {
            const childIndex = children[i];
            const parsed = parseNodes(gltf, buffers, images, childIndex);

            if (parsed) {
                result.push(...parsed);
            }
        }

        return result;
    }

    return null;
};

const parseScene = (
    gltf: GLTF,
    buffers: ArrayBuffer[],
    images: HTMLImageElement[],
    { nodes }: GLTFScene
): GLTFParsedMesh[] => {
    if (!nodes) return [];

    const result: GLTFParsedMesh[] = [];

    for (let i = 0; i < nodes.length; i++) {
        const nodeIndex = nodes[i];
        const parsed = parseNodes(gltf, buffers, images, nodeIndex);
        if (parsed) {
            result.push(...parsed);
        }
    }

    return result;
};

export type ParsedGLTF = GLTFParsedMesh[];

export const parseGLTF = async (gltf: GLTF): Promise<ParsedGLTF> => {
    const { buffers, scene, scenes, images } = gltf;

    const bufferPromises: Promise<ArrayBuffer>[] = [];
    const texturePromises: Promise<HTMLImageElement>[] = [];

    buffers.forEach(({ uri }) => {
        bufferPromises.push(
            fetch(`resources/bins/${uri}`).then((res) => res.arrayBuffer())
        );
    });

    images?.forEach(({ uri }) => {
        texturePromises.push(loadImage(`resources/textures/${uri}`));
    });

    const bufferData = await Promise.all(bufferPromises);
    const textures = await Promise.all(texturePromises);

    const entry = scenes[scene];
    const result = parseScene(gltf, bufferData, textures, entry);

    return result;
};
