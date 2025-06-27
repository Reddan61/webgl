import { Material } from "engine/Material";
import {
    ACCESSOR_TYPE,
    ANIMATION_INTERPOLATION,
    COMPONENT_TYPE,
    GLTF,
    GLTFAnimationChannel,
    GLTFAnimationSampler,
} from "./types";
import { Mesh } from "engine/Mesh";
import { EngineObject } from "engine/EngineObject";
import { Bone } from "engine/Bones/Bones";
import { Skeleton } from "engine/Skeleton";
import { loadImage } from "engine/Utils/Utils";
import { MeshPrimitive } from "engine/MeshPrimitive";
import {
    AnimationChannel,
    AnimationSampler,
    BoneAnimation,
} from "engine/Animation/BoneAnimation";
import { Skin } from "engine/Skin";

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

const parseMaterial = (
    gltf: GLTF,
    images: HTMLImageElement[],
    materialIndex: number
): Material => {
    const { materials } = gltf;
    const { pbrMetallicRoughness, alphaCutoff, alphaMode, normalTexture } =
        materials[materialIndex];

    const material = new Material({
        alphaCutoff,
        alphaMode,
        normalImage: normalTexture
            ? parseTexture(gltf, images, normalTexture.index)
            : null,
    });

    if (pbrMetallicRoughness) {
        const { baseColorTexture, baseColorFactor = [1, 1, 1, 1] } =
            pbrMetallicRoughness;

        material.setColor(baseColorFactor);

        if (baseColorTexture) {
            const { index } = baseColorTexture;

            material.setBaseImage(parseTexture(gltf, images, index));
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
            const {
                NORMAL,
                POSITION,
                TEXCOORD_0,
                JOINTS_0,
                WEIGHTS_0,
                TANGENT,
            } = attributes;

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
                tangents:
                    TANGENT !== undefined
                        ? getAccessorData(gltf, buffers, TANGENT).data
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

    if (!skins) return [];

    const resultSkins = [];

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const skinIndex = node.getSkin();
        const mesh = node.getMeshIndex();

        if (skinIndex !== null && mesh !== null) {
            const {
                inverseBindMatrices,
                joints,
                skeleton = joints[0],
            } = skins[skinIndex];

            if (inverseBindMatrices !== undefined) {
                const skin = new Skin(
                    skeleton,
                    joints,
                    getAccessorData(gltf, buffers, inverseBindMatrices).data
                );

                resultSkins.push(skin);
            }
        }
    }

    return resultSkins;
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

const parseAnimations = (gltf: GLTF, buffers: ArrayBuffer[], bones: Bone[]) => {
    const { animations } = gltf;

    if (!animations) return null;

    const bonesAnimations: BoneAnimation[] = [];

    for (let i = 0; i < animations.length; i++) {
        const { samplers, channels, name } = animations[i];
        const samplersParsed = parseSamplers(gltf, buffers, samplers);
        const channelsParsed = parseChannels(channels);

        bonesAnimations.push(
            new BoneAnimation(samplersParsed, channelsParsed, name)
        );
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

// TODO: мб сделать return bones[] и убрать result: Bone[]
const parseNode = (
    gltf: GLTF,
    result: Bone[],
    meshes: Mesh[],
    currentIndex: number,
    parentIndex: number | null = null
) => {
    const { nodes } = gltf;
    const node = nodes[currentIndex];

    const bone = new Bone(node, currentIndex, parentIndex);
    result[currentIndex] = bone;

    const skinIndex = bone.getSkin();
    const meshIndex = bone.getMeshIndex();

    if (skinIndex !== null && meshIndex !== null) {
        meshes[meshIndex].setSkin(skinIndex);
    }

    const children = node.children ?? [];

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        parseNode(gltf, result, meshes, child, currentIndex);
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

export const parseGLTF = async (gltf: GLTF): Promise<EngineObject> => {
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
            parsePrimitives(gltf, bufferData, textures, index)
        );

        return mesh;
    });

    const { bones } = parseNodes(gltf, meshes);

    const skins = parseSkins(gltf, bones, bufferData);
    const skeleton = new Skeleton(bones, skins);

    const bonesAnimations = parseAnimations(gltf, bufferData, bones) ?? [];

    const object = new EngineObject(
        meshes,
        [0, 0, 0],
        [1, 1, 1],
        skeleton,
        bonesAnimations
    );

    return object;
};
