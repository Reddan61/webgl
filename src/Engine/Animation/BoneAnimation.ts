import { vec2, vec3, vec4 } from "gl-matrix";
import { Bone } from "../Bones/Bones";
import {
    ACCESSOR_TYPE,
    ANIMATION_INTERPOLATION,
    ANIMATION_PATH,
} from "../Utils/GLTF/types";

export interface AnimationSampler {
    input: {
        data: number[];
        max: number[];
        min: number[];
    };
    output: {
        data: number[];
        max: number[];
        min: number[];
    };
    interpolation: ANIMATION_INTERPOLATION;
}

export interface AnimationChannel {
    sampler: number;
    target: {
        bone: number;
        path: ANIMATION_PATH;
    };
}

const VECTORS_TYPE = {
    [ACCESSOR_TYPE.VEC2]: vec2,
    [ACCESSOR_TYPE.VEC3]: vec3,
    [ACCESSOR_TYPE.VEC4]: vec4,
};

const VECTOR_LENGTH = {
    [ACCESSOR_TYPE.VEC2]: 2,
    [ACCESSOR_TYPE.VEC3]: 3,
    [ACCESSOR_TYPE.VEC4]: 4,
};
export class BoneAnimation {
    private samplers: AnimationSampler[] = [];
    private channels: AnimationChannel[] = [];

    constructor(samplers: AnimationSampler[], channels: AnimationChannel[]) {
        this.samplers = samplers;
        this.channels = channels;
    }

    public update(bones: Bone[]) {
        const currentTime = performance.now() / 1000;

        for (let i = 0; i < this.channels.length; i++) {
            const {
                sampler,
                target: { bone: boneIndex, path },
            } = this.channels[i];
            const { input, output } = this.samplers[sampler];

            const animationLength = input.max[0] - input.min[0];
            const animationTime = currentTime % animationLength;
            let previousTimeIndex = 0;

            for (let j = 0; j < input.data.length; j++) {
                if (animationTime < input.data[j]) {
                    break;
                }
                previousTimeIndex = j;
            }

            const previousTime = input.data[previousTimeIndex];
            const nextTimeIndex = previousTimeIndex + 1;
            const nextTime = input.data[nextTimeIndex];

            const interpolationValue =
                (animationTime - previousTime) / (nextTime - previousTime);

            const bone = bones[boneIndex];
            let newTranslation = null as vec3 | null;
            let newRotation = null as vec4 | null;
            let isUpdated = false;

            if (path === ANIMATION_PATH.TRANSLATION) {
                const prevTranslationStart = previousTimeIndex * 3;
                const nextTranslationStart = nextTimeIndex * 3;

                const prevTranslation = vec3.fromValues(
                    output.data[prevTranslationStart],
                    output.data[prevTranslationStart + 1],
                    output.data[prevTranslationStart + 2]
                );

                const nextTranslation = vec3.fromValues(
                    output.data[nextTranslationStart],
                    output.data[nextTranslationStart + 1],
                    output.data[nextTranslationStart + 2]
                );
                const currentPos = vec3.create();

                vec3.subtract(currentPos, nextTranslation, prevTranslation);
                vec3.scale(currentPos, currentPos, interpolationValue);
                vec3.add(currentPos, prevTranslation, currentPos);

                newTranslation = currentPos;
                isUpdated = true;
            }

            if (path === ANIMATION_PATH.ROTATION) {
                const prevRotateStart = previousTimeIndex * 4;
                const nextRotateStart = nextTimeIndex * 4;
                const prevRotate = vec4.fromValues(
                    output.data[prevRotateStart],
                    output.data[prevRotateStart + 1],
                    output.data[prevRotateStart + 2],
                    output.data[prevRotateStart + 3]
                );
                const nextRotate = vec4.fromValues(
                    output.data[nextRotateStart],
                    output.data[nextRotateStart + 1],
                    output.data[nextRotateStart + 2],
                    output.data[nextRotateStart + 3]
                );
                const currentRotate = vec4.create();

                vec4.subtract(currentRotate, nextRotate, prevRotate);
                vec4.scale(currentRotate, currentRotate, interpolationValue);
                vec4.add(currentRotate, prevRotate, currentRotate);

                newRotation = currentRotate;
                isUpdated = true;
            }

            bone.setTranslationNRotation(
                newTranslation ?? undefined,
                newRotation ?? undefined
            );

            if (isUpdated) {
                bone.update(bones);
            }
        }
    }
}
