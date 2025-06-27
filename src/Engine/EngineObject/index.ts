import { vec3 } from "gl-matrix";
import { Mesh } from "engine/Mesh";
import { AABB } from "engine/AABB";
import { Transform } from "engine/Transform/Transform";
import { BoneAnimation } from "engine/Animation/BoneAnimation";
import { unsubArr } from "engine/Utils/Utils";
import { Skeleton } from "engine/Skeleton";

type OnNameUpdateCb = (name: string) => void;

export class EngineObject {
    protected skeleton: Skeleton | null = null;
    protected meshes: Mesh[];
    protected singleFace = false;
    protected flipYTexture = true;
    protected aabb: AABB;
    protected name = "DefaultObjectName";

    protected transform: Transform;

    protected animations: BoneAnimation[] = [];
    protected selectedAnimation: BoneAnimation | null = null;

    protected onNameUpdateSubscribers: OnNameUpdateCb[] = [];

    protected needToUpdateAABB = false;

    constructor(
        meshes: Mesh[],
        position: vec3,
        scaling: vec3,
        skeleton: EngineObject["skeleton"] = null,
        animations: BoneAnimation[] = []
    ) {
        this.meshes = meshes;
        this.skeleton = skeleton;
        this.animations = animations;

        this.skeleton?.update(this.meshes);

        this.transform = new Transform();
        this.transform.setPosition(position);
        this.transform.setScaling(scaling);

        this.animationSubscribe();

        this.meshes.forEach((mesh) => {
            mesh.getTransform().setParentTransform(this.getTransform());
            mesh.addUpdateAABBSubscriber(() => {
                this.needToUpdateAABB = true;
            });
        });

        this.createAABB();
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.skeleton?._setWebGl(webgl);

        this.meshes.forEach((mesh) => {
            mesh._setWebGl(webgl);
        });
    }

    public getMeshes() {
        return this.meshes;
    }

    public isSingleFace() {
        return this.singleFace;
    }

    public isFlipYTexture() {
        return this.flipYTexture;
    }

    public getAABB() {
        return this.aabb;
    }

    public setFlipYTexture(bool: boolean) {
        this.flipYTexture = bool;
    }

    public setSingleFace(bool: boolean) {
        this.singleFace = bool;
    }

    public setName(name: string) {
        this.name = name;
        this.onNameUpdateSubscribers.forEach((cb) => cb(this.name));
    }

    public getName() {
        return this.name;
    }

    public onNameUpdate(cb: OnNameUpdateCb) {
        this.onNameUpdateSubscribers.push(cb);

        return unsubArr(this.onNameUpdateSubscribers, (cur) => cur === cb);
    }

    public update() {
        if (this.skeleton) {
            this.selectedAnimation?.update(this.skeleton);
            this.skeleton.update(this.meshes);
        }

        this.meshes.forEach((mesh) => mesh.update());

        if (this.needToUpdateAABB) {
            this.createAABB();
            this.needToUpdateAABB = false;
        }
    }

    public selectAnimation(animation: BoneAnimation | null) {
        this.selectedAnimation?.stop();
        this.selectedAnimation = animation;
        this.selectedAnimation?.start();
    }

    public getCurrentAnimation() {
        return this.selectedAnimation;
    }
    public getAnimations() {
        return this.animations;
    }

    public getTransform() {
        return this.transform;
    }

    public getSkeleton() {
        return this.skeleton;
    }

    public copy() {
        const position = vec3.copy(vec3.create(), this.transform.getPosition());
        const scaling = vec3.copy(vec3.create(), this.transform.getScaling());
        const copiedMeshes = this.meshes.map((mesh) => mesh.copy());
        const skeleton = this.skeleton?.copy();
        const animations = this.animations.map((animation) => animation.copy());

        return new EngineObject(
            copiedMeshes,
            position,
            scaling,
            skeleton,
            animations
        );
    }

    protected animationSubscribe() {
        this.animations.forEach((animation) => {
            animation.onStopSubscribe(() => this.skeleton?.default());
        });
    }

    protected createAABB() {
        let max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
        let min = vec3.fromValues(Infinity, Infinity, Infinity);

        this.meshes.forEach((mesh) => {
            const aabb = mesh.getAABB();
            const maxMin = aabb.getMaxMin();

            vec3.max(max, max, maxMin.max);
            vec3.min(min, min, maxMin.min);
        });

        this.aabb = new AABB(max, min);
    }
}
