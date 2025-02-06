import { Material } from "engine/Material";
import { Mesh } from "engine/Mesh";
import { MeshPrimitive } from "engine/MeshPrimitive";
import { vec3, vec4 } from "gl-matrix";

export const createArrow = (color: vec4) => {
    const min = vec3.fromValues(Infinity, Infinity, Infinity);
    const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);

    const vertices = [
        0.0, 0.0, 0.0, 0.05, 0.05, 0.0, -0.05, 0.05, 0.0, -0.05, -0.05, 0.0,
        0.05, -0.05, 0.0, 0.05, 0.05, 1.0, -0.05, 0.05, 1.0, -0.05, -0.05, 1.0,
        0.05, -0.05, 1.0, 0.1, 0.0, 1.0, 0.07, 0.07, 1.0, 0.0, 0.1, 1.0, -0.07,
        0.07, 1.0, -0.1, 0.0, 1.0, -0.07, -0.07, 1.0, 0.0, -0.1, 1.0, 0.07,
        -0.07, 1.0, 0.0, 0.0, 1.2,
    ];

    for (let i = 0; i < vertices.length; i += 3) {
        const vertex = vec3.fromValues(
            vertices[i],
            vertices[i + 1],
            vertices[i + 2]
        );

        vec3.min(min, min, vertex);
        vec3.max(max, max, vertex);
    }

    const indices = [
        1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 4, 8, 3, 8, 7, 4, 1, 5, 4, 5, 8,
        0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 5, 6, 7, 5, 7, 8, 17, 9, 10, 17, 10,
        11, 17, 11, 12, 17, 12, 13, 17, 13, 14, 17, 14, 15, 17, 15, 16, 17, 16,
        9, 9, 10, 11, 9, 11, 12, 9, 12, 13, 9, 13, 14, 9, 14, 15, 9, 15, 16,
    ];

    const mesh = new Mesh([
        new MeshPrimitive(
            {
                indices,
                normals: [],
                textureCoords: [],
                vertices: {
                    data: vertices,
                    max: max as number[],
                    min: min as number[],
                },
            },
            new Material({
                color,
            })
        ),
    ]);

    return mesh;
};
