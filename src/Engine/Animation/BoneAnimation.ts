import { vec3, vec4 } from "gl-matrix";
import { ANIMATION_INTERPOLATION, ANIMATION_PATH } from "../Utils/GLTF/types";
import { Skeleton } from "engine/Skeleton";
import { unsubArr } from "engine/Utils/Utils";

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

type OnStopListener = () => void;

export class BoneAnimation {
    private samplers: AnimationSampler[] = [];
    private channels: AnimationChannel[] = [];
    private name: string;
    private animationStartTime = 0;
    private pauseTime = 0;
    private isPlaying = false;

    private onStopListeners = [] as OnStopListener[];

    constructor(
        samplers: AnimationSampler[],
        channels: AnimationChannel[],
        name = "DEFAULT_ANIMATION_NAME"
    ) {
        this.samplers = samplers;
        this.channels = channels;
        this.name = name;
    }

    public copy() {
        return new BoneAnimation(this.samplers, this.channels, this.name);
    }

    public getName() {
        return this.name;
    }

    public start() {
        if (this.isPlaying) {
            this.animationStartTime = performance.now() / 1000;
        } else {
            this.animationStartTime +=
                performance.now() / 1000 - this.pauseTime;
        }

        this.isPlaying = true;
    }

    public pause() {
        this.isPlaying = false;
        this.pauseTime = performance.now() / 1000;
    }

    public onStopSubscribe(cb: OnStopListener) {
        this.onStopListeners.push(cb);

        return unsubArr(this.onStopListeners, (cur) => cur === cb);
    }

    public stop() {
        this.isPlaying = false;
        this.animationStartTime = 0;
        this.pauseTime = 0;

        this.onStopPublish();
    }

    public update(skeleton: Skeleton) {
        const bones = skeleton.getBones();

        if (!this.isPlaying || !bones.length) return;

        const now = performance.now() / 1000;
        const currentTime = now - this.animationStartTime;

        for (let i = 0; i < this.channels.length; i++) {
            const {
                sampler,
                target: { bone: boneIndex, path },
            } = this.channels[i];
            const { input, output } = this.samplers[sampler];

            const animationLength = input.max[0] - input.min[0];

            if (animationLength <= 0) {
                continue;
            }

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
            let newScale = null as vec3 | null;
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

            if (path === ANIMATION_PATH.SCALE) {
                const prevScaleStart = previousTimeIndex * 3;
                const nextScaleStart = nextTimeIndex * 3;
                const prevScale = vec3.fromValues(
                    output.data[prevScaleStart],
                    output.data[prevScaleStart + 1],
                    output.data[prevScaleStart + 2]
                );
                const nextScale = vec3.fromValues(
                    output.data[nextScaleStart],
                    output.data[nextScaleStart + 1],
                    output.data[nextScaleStart + 2]
                );
                const currentScale = vec3.create();

                vec3.subtract(currentScale, nextScale, prevScale);
                vec3.scale(currentScale, currentScale, interpolationValue);
                vec3.add(currentScale, prevScale, currentScale);

                newScale = currentScale;
                isUpdated = true;
            }

            bone.setTRS(
                newTranslation ?? undefined,
                newRotation ?? undefined,
                newScale ?? undefined
            );

            if (isUpdated) {
                skeleton.updateBone(bone);
            }
        }
    }

    protected onStopPublish() {
        this.onStopListeners.forEach((cb) => cb());
    }
}
