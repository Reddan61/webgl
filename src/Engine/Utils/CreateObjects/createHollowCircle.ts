import { Material } from "engine/Material";
import { Mesh } from "engine/Mesh";
import { MeshPrimitive } from "engine/MeshPrimitive";
import { vec3, vec4 } from "gl-matrix";

export const createHollowCircle = (
    color: vec4,
    innerRadius: number,
    outerRadius: number,
    thickness: number,
    segments: number
) => {
    const min = vec3.fromValues(Infinity, Infinity, Infinity);
    const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);

    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;

        const outerX = Math.cos(angle) * outerRadius;
        const outerY = Math.sin(angle) * outerRadius;
        vertices.push(outerX, outerY, thickness / 2);

        const innerX = Math.cos(angle) * innerRadius;
        const innerY = Math.sin(angle) * innerRadius;
        vertices.push(innerX, innerY, thickness / 2);

        vertices.push(outerX, outerY, -thickness / 2);

        vertices.push(innerX, innerY, -thickness / 2);

        vec3.min(min, min, vec3.fromValues(outerX, outerY, thickness / 2));
        vec3.max(max, max, vec3.fromValues(outerX, outerY, thickness / 2));
        vec3.min(min, min, vec3.fromValues(innerX, innerY, thickness / 2));
        vec3.max(max, max, vec3.fromValues(innerX, innerY, thickness / 2));
        vec3.min(min, min, vec3.fromValues(outerX, outerY, -thickness / 2));
        vec3.max(max, max, vec3.fromValues(outerX, outerY, -thickness / 2));
        vec3.min(min, min, vec3.fromValues(innerX, innerY, -thickness / 2));
        vec3.max(max, max, vec3.fromValues(innerX, innerY, -thickness / 2));
    }

    for (let i = 0; i < segments; i++) {
        const currentOuterTop = i * 4;
        const currentInnerTop = i * 4 + 1;
        const currentOuterBottom = i * 4 + 2;
        const currentInnerBottom = i * 4 + 3;

        const nextOuterTop = ((i + 1) % segments) * 4;
        const nextInnerTop = ((i + 1) % segments) * 4 + 1;
        const nextOuterBottom = ((i + 1) % segments) * 4 + 2;
        const nextInnerBottom = ((i + 1) % segments) * 4 + 3;

        indices.push(currentOuterTop, nextOuterTop, currentInnerTop);
        indices.push(currentInnerTop, nextOuterTop, nextInnerTop);

        indices.push(currentOuterBottom, currentInnerBottom, nextOuterBottom);
        indices.push(currentInnerBottom, nextInnerBottom, nextOuterBottom);

        indices.push(currentOuterTop, nextOuterTop, currentOuterBottom);
        indices.push(nextOuterTop, nextOuterBottom, currentOuterBottom);

        indices.push(currentInnerTop, currentInnerBottom, nextInnerTop);
        indices.push(currentInnerBottom, nextInnerBottom, nextInnerTop);
    }

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
