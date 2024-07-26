import { parseObj } from "./Converters";
import { GLTFParsedResult, parseGLTF } from "./GLTF";

export const loadImage = async (url: string): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    });
}

interface ObjectFormatLoaderResult {
    vertices: number[];
    indices: number[];
    textureCoords: number[];
    normals: number[];
}

export const loadObj= async (url: string): Promise<ObjectFormatLoaderResult> => {
    return new Promise(resolve => {
        fetch(url).then(res => res.text()).then(text => {
            resolve(parseObj(text));
        })
    });
}

export const loadGLTF = (url: string): Promise<GLTFParsedResult[]> => {
    return new Promise(resolve => {
        fetch(url).then(res => res.json()).then(json => {
            resolve(parseGLTF(json));
        })
    });
}