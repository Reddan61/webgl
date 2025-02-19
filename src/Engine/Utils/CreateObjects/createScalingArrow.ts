import { Material } from "engine/Material";
import { Mesh } from "engine/Mesh";
import { MeshPrimitive } from "engine/MeshPrimitive";
import { vec3, vec4 } from "gl-matrix";

export const createScalingArrow = (color: vec4) => {
    const min = vec3.fromValues(Infinity, Infinity, Infinity);
    const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);

    const vertices = [
        0.0, 0.0, 0.0, 0.05, 0.05, 0.0, -0.05, 0.05, 0.0, -0.05, -0.05, 0.0,
        0.05, -0.05, 0.0, 0.05, 0.05, 1.0, -0.05, 0.05, 1.0, -0.05, -0.05, 1.0,
        0.05, -0.05, 1.0, 0.1, 0.1, 1.0, -0.1, 0.1, 1.0, -0.1, -0.1, 1.0, 0.1,
        -0.1, 1.0, 0.1, 0.1, 1.2, -0.1, 0.1, 1.2, -0.1, -0.1, 1.2, 0.1, -0.1,
        1.2,
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
        0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3,
        3, 7, 8, 3, 8, 4, 4, 8, 5, 4, 5, 1, 5, 6, 7, 5, 7, 8, 9, 10, 11, 9, 11,
        12, 13, 14, 15, 13, 15, 16, 9, 10, 14, 9, 14, 13, 10, 11, 15, 10, 15,
        14, 11, 12, 16, 11, 16, 15, 12, 9, 13, 12, 13, 16,
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
