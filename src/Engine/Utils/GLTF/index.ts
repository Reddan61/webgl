import { vec4 } from "gl-matrix";
import { loadImage } from "../Utils";
import {
    ACCESSOR_TYPE,
    ANIMATION_INTERPOLATION,
    COMPONENT_TYPE,
    GLTF,
    GLTFAnimationChannel,
    GLTFAnimationSampler,
} from "./types";
import { Bone } from "../../Bones/Bones";
import {
    AnimationChannel,
    AnimationSampler,
    BoneAnimation,
} from "../../Animation/BoneAnimation";
import { MeshPrimitive } from "../../MeshPrimitive";
import { Material } from "../../Material";
import { Mesh } from "../../Mesh";
import { Skeleton } from "../../Skeleton";
import { Object } from "../../Object";

const TYPED_ARRAYS = {
    [COMPONENT_TYPE.BYTE]: Int8Array,
    [COMPONENT_TYPE.UNSIGNED_BYTE]: Uint8Array,
    [COMPONENT_TYPE.SHORT]: Int16Array,
    [COMPONENT_TYPE.UNSIGNED_SHORT]: Uint16Array,
    [COMPONENT_TYPE.UNSIGNED_INT]: Uint32Array,
    [COMPONENT_TYPE.FLOAT]: Float32Array,
};

export const ACCESSOR_LENGTH: Record<ACCESSOR_TYPE, number> = {
    [ACCESSOR_TYPE.SCALAR]: 1,
    [ACCESSOR_TYPE.VEC2]: 2,
    [ACCESSOR_TYPE.VEC3]: 3,
    [ACCESSOR_TYPE.VEC4]: 4,
    [ACCESSOR_TYPE.MAT2]: 4,
    [ACCESSOR_TYPE.MAT3]: 9,
    [ACCESSOR_TYPE.MAT4]: 16,
};

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
    const newByteStride =
        byteStride || myTypedArray.BYTES_PER_ELEMENT * ACCESSOR_LENGTH[type];

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
        type,
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
): Material => {
    const { materials } = gltf;
    const { pbrMetallicRoughness } = materials[materialIndex];

    const material = new Material();

    if (pbrMetallicRoughness) {
        const { baseColorTexture, baseColorFactor = [1, 1, 1, 1] } =
            pbrMetallicRoughness;

        material.setColor(baseColorFactor);

        if (baseColorTexture) {
            const { index } = baseColorTexture;

            material.setImage(parseTexture(gltf, images, index));
        }
    }

    return material;
};

const parsePrimitives = (
    gltf: GLTF,
    buffers: ArrayBuffer[],
    images: HTMLImageElement[],
    meshIndex: number
): MeshPrimitive[] => {
    const { meshes } = gltf;

    const { primitives } = meshes[meshIndex];

    const result: MeshPrimitive[] = [];

    for (let i = 0; i < primitives.length; i++) {
        const {
            indices: indicesIndex,
            attributes,
            mode = 4,
            material,
        } = primitives[i];

        if (indicesIndex !== undefined) {
            const { NORMAL, POSITION, TEXCOORD_0, JOINTS_0, WEIGHTS_0 } =
                attributes;

            const meshPrimitive = new MeshPrimitive({
                indices: getAccessorData(gltf, buffers, indicesIndex).data,
                normals: getAccessorData(gltf, buffers, NORMAL).data,
                textureCoords: getAccessorData(gltf, buffers, TEXCOORD_0).data,
                vertices: getAccessorData(gltf, buffers, POSITION),
                joints:
                    JOINTS_0 !== undefined
                        ? getAccessorData(gltf, buffers, JOINTS_0).data
                        : null,
                weight:
                    WEIGHTS_0 !== undefined
                        ? getAccessorData(gltf, buffers, WEIGHTS_0).data
                        : null,
            });

            if (material !== undefined) {
                const materialParsed = parseMaterial(gltf, images, material);

                meshPrimitive.setMaterial(materialParsed);
            }

            result.push(meshPrimitive);
        }
    }

    return result;
};

const parseSkins = (gltf: GLTF, nodes: Bone[], buffers: ArrayBuffer[]) => {
    const { skins } = gltf;

    if (!skins) return null;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const skinIndex = node.getSkin();
        const mesh = node.getMesh();

        if (skinIndex !== null && mesh !== null) {
            const { inverseBindMatrices, joints } = skins[skinIndex];

            if (inverseBindMatrices !== undefined) {
                const skeleton = new Skeleton(
                    nodes,
                    joints,
                    getAccessorData(gltf, buffers, inverseBindMatrices).data
                );

                mesh.setSkeleton(skeleton);
            }
        }
    }
};

const parseChannels = (channels: GLTFAnimationChannel[]) => {
    const parsedChannels: AnimationChannel[] = channels.map((el) => ({
        sampler: el.sampler,
        target: {
            bone: el.target.node ?? 0,
            path: el.target.path,
        },
    }));

    return parsedChannels;
};

const parseAnimations = (gltf: GLTF, buffers: ArrayBuffer[]) => {
    const { animations } = gltf;

    if (!animations) return null;

    const bonesAnimations: BoneAnimation[] = [];

    for (let i = 0; i < animations.length; i++) {
        const { samplers, channels } = animations[i];
        const samplersParsed = parseSamplers(gltf, buffers, samplers);
        const channelsParsed = parseChannels(channels);

        bonesAnimations.push(new BoneAnimation(samplersParsed, channelsParsed));
    }

    return bonesAnimations;
};

const parseSamplers = (
    gltf: GLTF,
    buffers: ArrayBuffer[],
    samplers: GLTFAnimationSampler[]
) => {
    const result: AnimationSampler[] = [];

    for (let i = 0; i < samplers.length; i++) {
        const {
            input,
            output,
            interpolation = ANIMATION_INTERPOLATION.LINEAR,
        } = samplers[i];

        const inputParsed = getAccessorData(gltf, buffers, input);
        const outputParsed = getAccessorData(gltf, buffers, output);

        result.push({
            input: {
                data: inputParsed.data,
                max: inputParsed.max,
                min: inputParsed.min,
            },
            output: {
                data: outputParsed.data,
                max: outputParsed.max,
                min: outputParsed.min,
            },
            interpolation,
        });
    }

    return result;
};

const parseNode = (
    gltf: GLTF,
    result: Bone[],
    meshes: Mesh[],
    index: number,
    parentIndex: number | null = null
) => {
    const { nodes } = gltf;
    const node = nodes[index];
    const parent = parentIndex !== null ? result[parentIndex] : null;

    const bone = new Bone(
        node,
        parent,
        node.mesh !== undefined ? meshes[node.mesh] : null
    );
    result[index] = bone;

    const children = node.children ?? [];

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        parseNode(gltf, result, meshes, child, index);

        bone.setChildren(children.map((child) => result[child]));
    }
};

const parseNodes = (gltf: GLTF, meshes: Mesh[]) => {
    const { scenes } = gltf;
    const bones: Bone[] = [];

    for (let i = 0; i < scenes.length; i++) {
        const { nodes = [] } = scenes[i];

        const entry = nodes[0] ?? 0;

        parseNode(gltf, bones, meshes, entry);
    }

    return {
        bones,
    };
};

export const parseGLTF = async (gltf: GLTF): Promise<Object> => {
    const { buffers, images } = gltf;

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

    const meshes = gltf.meshes.map((_, index) => {
        const mesh = new Mesh(
            parsePrimitives(gltf, bufferData, textures, index),
            null
        );

        return mesh;
    });

    const { bones } = parseNodes(gltf, meshes);

    parseSkins(gltf, bones, bufferData);
    const bonesAnimations = parseAnimations(gltf, bufferData) ?? [];

    const object = new Object(
        meshes,
        [0, 0, 0],
        [1, 1, 1],
        bones,
        bonesAnimations
    );

    return object;
};
