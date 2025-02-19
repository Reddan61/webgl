import { vec3 } from "gl-matrix";
import { Ray } from "engine/Ray";
import { AXIS_ENUM } from "engine/Utils/types";

export const axisIntersection = (
    ray: Ray,
    position: vec3,
    axis: AXIS_ENUM
): null | vec3 => {
    const dir = ray.getDirection();
    const origin = ray.getOrigin();
    const axisDir = vec3.create();
    axisDir[axis] = 1;

    const AB = vec3.create();
    vec3.subtract(AB, origin, position);

    const dotAR = vec3.dot(axisDir, dir);
    const dotAA = vec3.dot(axisDir, axisDir);
    const dotRR = vec3.dot(dir, dir);
    const dotAB_A = vec3.dot(AB, axisDir);
    const dotAB_R = vec3.dot(AB, dir);

    const denom = dotAA * dotRR - dotAR * dotAR;

    if (Math.abs(denom) < 1e-6) {
        return null;
    }

    let t = (dotAB_A * dotAR - dotAB_R * dotAA) / denom;
    let s = (dotAB_A + t * dotAR) / dotAA;

    let projection = vec3.create();
    vec3.scaleAndAdd(projection, position, axisDir, s);

    return projection;
};
