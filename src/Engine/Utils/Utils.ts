import { parseObj, ParseOBJResult } from "./OBJ";
import { parseGLTF } from "./GLTF";
import { vec3 } from "gl-matrix";

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

export const createSphere = (radius: number, segments: number) => {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Инициализация min и max векторов с использованием glMatrix
    const min = vec3.fromValues(Infinity, Infinity, Infinity);
    const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);

    for (let lat = 0; lat <= segments; lat++) {
        const theta = (lat * Math.PI) / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= segments; lon++) {
            const phi = (lon * 2 * Math.PI) / segments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            // Координаты вершины
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            // Вершина (умноженная на радиус)
            const vertex = vec3.fromValues(radius * x, radius * y, radius * z);
            vertices.push(vertex[0], vertex[1], vertex[2]);

            // Нормаль (единичный вектор)
            const normal = vec3.normalize(
                vec3.create(),
                vec3.fromValues(x, y, z)
            );
            normals.push(normal[0], normal[1], normal[2]);

            // Обновление min и max значений
            vec3.min(min, min, vertex); // Обновляем min
            vec3.max(max, max, vertex); // Обновляем max
        }
    }

    for (let lat = 0; lat < segments; lat++) {
        for (let lon = 0; lon < segments; lon++) {
            const first = lat * (segments + 1) + lon;
            const second = first + segments + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        vertices,
        normals,
        indices,
        min: vec3.clone(min),
        max: vec3.clone(max),
    };
};
