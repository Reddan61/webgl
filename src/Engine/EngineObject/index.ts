import { vec3 } from "gl-matrix";
import { Mesh } from "engine/Mesh";
import { AABB } from "engine/AABB";
import { Transform } from "engine/Transform/Transform";
import { BoneAnimation } from "engine/Animation/BoneAnimation";
import { unsubArr } from "engine/Utils/Utils";
import { Bone } from "engine/Bones/Bones";

type OnNameUpdateCb = (name: string) => void;

export class EngineObject {
    protected bones: Bone[];
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
        bones: Bone[] = [],
        animations: BoneAnimation[] = []
    ) {
        this.meshes = meshes;
        this.bones = bones;
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

    // TODO: refactor skeleton
    public copy() {
        const copiedMeshes = this.meshes.map((mesh) => mesh.copy([]));
        const copiedBones: Bone[] = [];
        this.copyBones(copiedBones, copiedMeshes, this.bones[0], null);

        copiedMeshes.forEach((mesh) =>
            mesh.getSkeleton()?.setBones(copiedBones)
        );

        const transform = this.getTransform();

        const copiedAnimations = this.animations.map((animation) =>
            animation.copy(copiedBones)
        );

        return new EngineObject(
            copiedMeshes,
            vec3.copy(vec3.create(), transform.getPosition()),
            vec3.copy(vec3.create(), transform.getScaling()),
            copiedBones,
            copiedAnimations
        );
    }

    private copyBones(
        result: Bone[],
        copiedMeshes: Mesh[],
        currentBone: Bone,
        parentIndex: number | null
    ) {
        const childrenIndexes = currentBone.getChildrenIndexes();

        const copiedSelf = currentBone.copy();
        const selfIndex = copiedSelf.getSelfIndex();
        result[selfIndex] = copiedSelf;

        if (parentIndex !== null) {
            copiedSelf.setParent(result[parentIndex]);
        }

        const selfMesh = currentBone.getMesh();

        if (selfMesh) {
            const meshIndex = this.meshes.findIndex(
                (mesh) => mesh === selfMesh
            );

            if (meshIndex >= 0) {
                copiedSelf.setMesh(copiedMeshes[meshIndex]);
            }
        }

        for (let i = 0; i < childrenIndexes.length; i++) {
            const childIndex = childrenIndexes[i];
            const child = this.bones[childIndex];

            this.copyBones(result, copiedMeshes, child, selfIndex);

            copiedSelf.setChildren(
                childrenIndexes.map((child) => result[child])
            );
        }
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
