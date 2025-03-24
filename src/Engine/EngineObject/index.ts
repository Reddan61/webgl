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
        this.createAABB();
    }

    public selectAnimation(animation: BoneAnimation | null) {
        this.selectedAnimation?.stop();
        this.selectedAnimation = animation;
        this.selectedAnimation?.start();
    }

    public getCurrentAnimation() {
        return this.selectedAnimation;
    }

    public getMeshModelMatrix(mesh: Mesh) {
        return mesh.getSkeleton() === null
            ? // we need to mul because we dont have skinning in shaders
              mat4.multiply(
                  mat4.create(),
                  this.transform.getModelMatrix(),
                  mesh.getTransform().getModelMatrix()
              )
            : // it will transform with skinning matrix in shader
              this.transform.getModelMatrix();
    }

    public getAnimations() {
        return this.animations;
    }

    public getTransform() {
        return this.transform;
    }

    public getMeshNormalMatrix(mesh: Mesh) {
        return mesh.getSkeleton() === null
            ? // we need to mul because we dont have skinning in shaders
              mat3.multiply(
                  mat3.create(),
                  this.transform.getNormalMatrix(),
                  mesh.getTransform().getNormalMatrix()
              )
            : // it will transform with skinning matrix in shader
              this.transform.getNormalMatrix();
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
