import { mat4, vec3, vec4 } from "gl-matrix";

export enum ACCESSOR_TYPE {
    SCALAR = "SCALAR",
    VEC2 = "VEC2",
    VEC3 = "VEC3",
    VEC4 = "VEC4",
    MAT2 = "MAT2",
    MAT3 = "MAT3",
    MAT4 = "MAT4",
}

export enum COMPONENT_TYPE {
    BYTE = 5120,
    UNSIGNED_BYTE = 5121,
    SHORT = 5122,
    UNSIGNED_SHORT = 5123,
    UNSIGNED_INT = 5125,
    FLOAT = 5126,
}

export interface GLTFScene {
    nodes?: number[];
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

export interface GLTFNode {
    camera?: number;
    children?: number[];
    skin?: number;
    matrix?: mat4;
    mesh?: number;
    rotation?: vec4;
    scale?: vec3;
    translation?: vec3;
    weights?: number[];
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFMeshPrimitivesAttributes {
    POSITION: number;
    NORMAL: number;
    TANGENT?: number;
    // TEXCOORD_n: number
    TEXCOORD_0: number;
    // COLOR_n: number
    COLOR_0: number;
    // JOINTS_n: number
    JOINTS_0?: number;
    // WEIGHTS_n: number
    WEIGHTS_0?: number;
}

interface GLTFMeshPrimitives {
    attributes: GLTFMeshPrimitivesAttributes;
    indices?: number;
    material?: number;
    // default 4
    mode?: number;
    targets?: unknown;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFMesh {
    primitives: GLTFMeshPrimitives[];
    weights?: number[];
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFAccessor {
    bufferView?: number;
    // default 0
    byteOffset?: number;
    componentType: COMPONENT_TYPE;
    // default false
    normalized?: boolean;
    count: number;
    type: ACCESSOR_TYPE;
    max?: number[];
    min?: number[];
    sparse?: unknown;
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFBufferView {
    buffer: number;
    // default 0
    byteOffset?: number;
    byteLength: number;
    byteStride?: number;
    target?: number;
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFBuffer {
    uri?: string;
    byteLength: number;
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFTexture {
    sampler?: number;
    source?: number;
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFImage {
    uri?: string;
    mimeType?: string;
    bufferView?: number;
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFSampler {
    magFilter?: number;
    minFilter?: number;
    // default 10497
    wrapS?: number;
    // default 10497
    wrapT?: number;
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFMaterialTextureInfo {
    index: number;
    // default 0
    texCoord?: number;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFMaterialNormalTextureInfo extends GLTFMaterialTextureInfo {
    // default 1
    scale?: number;
}

interface GLTFMaterialOcclusionTextureInfo extends GLTFMaterialTextureInfo {
    // default 1
    strength?: number;
}

interface GLTFMaterial {
    pbrMetallicRoughness?: {
        // default [1,1,1,1]
        baseColorFactor?: vec4;
        // default 1
        metallicFactor?: number;
        // default 1
        roughnessFactor?: number;
        baseColorTexture?: GLTFMaterialTextureInfo;
        metallicRoughnessTexture?: GLTFMaterialTextureInfo;
        extensions?: unknown;
        extras?: unknown;
    };
    normalTexture?: GLTFMaterialNormalTextureInfo;
    occlusionTexture?: GLTFMaterialOcclusionTextureInfo;
    emissiveTexture?: GLTFMaterialTextureInfo;
    // default [0, 0, 0]
    emissiveFactor?: vec3;
    // default OPAQUE
    alphaMode?: string;
    // default 0.5
    alphaCutoff?: number;
    // default false
    doubleSided?: boolean;
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

export enum ANIMATION_PATH {
    TRANSLATION = "translation",
    ROTATION = "rotation",
    SCALE = "scale",
    WEIGHTS = "weights",
}

export enum ANIMATION_INTERPOLATION {
    LINEAR = "LINEAR",
    STEP = "STEP",
    CUBICSPLINE = "CUBICSPLINE",
}

interface GLTFAnimationTarget {
    node?: number;
    path: ANIMATION_PATH;
    extensions?: unknown;
    extras?: unknown;
}

export interface GLTFAnimationChannel {
    sampler: number;
    target: GLTFAnimationTarget;
    extensions?: unknown;
    extras?: unknown;
}

export interface GLTFAnimationSampler {
    input: number;
    output: number;
    // default ANIMATION_INTERPOLATION.LINEAR
    interpolation?: ANIMATION_INTERPOLATION;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFAnimation {
    channels: GLTFAnimationChannel[];
    samplers: GLTFAnimationSampler[];
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

interface GLTFSkin {
    joints: number[];
    inverseBindMatrices?: number;
    skeleton?: number;
    name?: string;
    extensions?: unknown;
    extras?: unknown;
}

export interface GLTF {
    scene: number;
    scenes: GLTFScene[];
    nodes: GLTFNode[];
    meshes: GLTFMesh[];
    accessors: GLTFAccessor[];
    bufferViews: GLTFBufferView[];
    buffers: GLTFBuffer[];
    textures: GLTFTexture[];
    images?: GLTFImage[];
    samplers: GLTFSampler[];
    materials: GLTFMaterial[];
    animations?: GLTFAnimation[];
    skins?: GLTFSkin[];
}
