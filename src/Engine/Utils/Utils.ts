import { parseObj } from "./Converters";

export const loadImage = async (url: string): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    });
}

export const loadObj= async (url: string): Promise<
// {
//     vertices: number[];
//     indices: number[];
//     textureCoords: number[];
//     normals: number[];
// }
any
> => {
    return new Promise(resolve => {
        fetch(url).then(res => res.text()).then(text => {
            resolve(parseObj(text));
        })
    });
}