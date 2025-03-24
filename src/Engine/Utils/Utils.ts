import { parseObj, ParseOBJResult } from "./OBJ";
import { parseGLTF } from "./GLTF";

export const loadImage = async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
        const image = new Image();
        image.addEventListener("load", () => {
            resolve(image);
        });
        image.src = url;
    });
};

export const loadObj = async (url: string): Promise<ParseOBJResult> => {
    return new Promise((resolve) => {
        fetch(url)
            .then((res) => res.text())
            .then((text) => {
                resolve(parseObj(text));
            });
    });
};

export const loadGLTF = (url: string): ReturnType<typeof parseGLTF> => {
    return new Promise((resolve) => {
        fetch(url)
            .then((res) => res.json())
            .then((json) => {
                resolve(parseGLTF(json));
            });
    });
};

export const unsubArr = <T>(arr: T[], boolFunc: (cur: T) => boolean) => {
    return () => {
        const index = arr.findIndex((el) => boolFunc(el));

        if (index < 0) return;

        arr.splice(index, 1);
    };
};
