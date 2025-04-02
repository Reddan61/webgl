import { mat3, mat4, vec3 } from "gl-matrix";
import { Mesh } from "engine/Mesh";
import { AABB } from "engine/AABB";
import { Transform } from "engine/Transform/Transform";
import { BoneAnimation } from "engine/Animation/BoneAnimation";
import { unsubArr } from "engine/Utils/Utils";

type OnNameUpdateCb = (name: string) => void;

export class EngineObject {
    private meshes: Mesh[];
    private singleFace = false;
    private flipYTexture = true;
    private aabb: AABB;
    private name = "DefaultObjectName";

    private transform: Transform;

    private animations: BoneAnimation[] = [];
    private selectedAnimation: BoneAnimation | null = null;

    private onNameUpdateSubscribers: OnNameUpdateCb[] = [];

    private needToUpdateAABB = false;

    constructor(
        meshes: Mesh[],
        position: vec3,
        scaling: vec3,
        animations: BoneAnimation[] = []
    ) {
        this.meshes = meshes;
        this.animations = animations;

        this.transform = new Transform();
        this.transform.setPosition(position);
        this.transform.setScaling(scaling);

        this.meshes.forEach((mesh) => {
            mesh.getTransform().setParentTransform(this.getTransform());
            mesh.addUpdateAABBSubscriber(() => {
                this.needToUpdateAABB = true;
            });
        });

        this.createAABB();
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
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
        this.selectedAnimation?.update();
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

    private createAABB() {
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
