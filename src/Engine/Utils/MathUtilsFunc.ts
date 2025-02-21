import { vec3 } from "gl-matrix";
import { Ray } from "engine/Ray";
import { AXIS_ENUM } from "engine/Utils/types";

export const getNearPointOnRay = (
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

export const getAxisPlaneIntersection = (
    ray: Ray,
    position: vec3,
    axis: AXIS_ENUM
): null | vec3 => {
    const dir = ray.getDirection();
    const origin = ray.getOrigin();

    const planeNormal = vec3.fromValues(0, 0, 0);
    planeNormal[axis] = 1;

    const AB = vec3.create();
    vec3.subtract(AB, origin, position);

    const denom = vec3.dot(planeNormal, dir);

    if (Math.abs(denom) < 1e-6) {
        return null;
    }

    const t = -vec3.dot(planeNormal, AB) / denom;

    if (t < 0) {
        return null;
    }

    const intersection = vec3.create();
    vec3.scaleAndAdd(intersection, origin, dir, t);

    return intersection;
};

export const getAngleDegByTwoPointsWithOrigin = (
    point1: vec3,
    point2: vec3,
    origin: vec3,
    axis: AXIS_ENUM
) => {
    const v1 = vec3.sub(vec3.create(), point1, origin);
    const v2 = vec3.sub(vec3.create(), point2, origin);

    vec3.normalize(v1, v1);
    vec3.normalize(v2, v2);

    const dot = vec3.dot(v1, v2);
    const angle = Math.acos(Math.min(Math.max(dot, -1), 1));
    const angleDegrees = angle * (180 / Math.PI);

    const cross = vec3.create();
    vec3.cross(cross, v1, v2);

    const axisDir = vec3.fromValues(0, 0, 0);
    axisDir[axis] = 1;

    const direction = vec3.dot(cross, axisDir);

    const signedAngle = direction > 0 ? angleDegrees : -angleDegrees;

    return signedAngle;
};
