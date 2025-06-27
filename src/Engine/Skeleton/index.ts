import { Mesh } from "engine/Mesh";
import { Bone } from "engine/Bones/Bones";
import { unsubArr } from "engine/Utils/Utils";
import { Skin } from "engine/Skin";

type UpdateSubscriberCb = () => void;

export class Skeleton {
    private bones: Bone[];
    private skins: Skin[];

    private updateSubscribers: UpdateSubscriberCb[] = [];

    constructor(bones: Bone[], skins = [] as Skeleton["skins"]) {
        this.bones = bones;
        this.skins = skins;
    }

    public getBones() {
        return this.bones;
    }

    public getSkins() {
        return this.skins;
    }

    public getSkinByIndex(index: number | null) {
        return index !== null ? (this.skins[index] ?? null) : null;
    }

    public update(meshes: Mesh[]) {
        this.bones[0].update(this.bones, meshes);
        this.calculateSkins(meshes);
    }

    public default() {
        for (let i = 0; i < this.bones.length; i++) {
            this.bones[i].default();
            this.updateBone(this.bones[i]);
        }
    }

    public copy() {
        const copiedBones = this.bones.map((bone) => bone.copy());
        const copiedSkins = this.skins.map((skin) => skin.copy());

        return new Skeleton(copiedBones, copiedSkins);
    }

    public updateBone(bone: Bone) {
        bone.calculateLocal();
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.skins.forEach((skin) => skin._setWebGl(webgl));
    }

    public addUpdateSubscriber(cb: UpdateSubscriberCb) {
        this.updateSubscribers.push(cb);

        return unsubArr(this.updateSubscribers, (el) => el === cb);
    }

    protected calculateSkins(meshes: Mesh[]) {
        meshes.forEach((mesh) => {
            const skinIndex = mesh.getSkinIndex();
            const skin = this.getSkinByIndex(skinIndex);

            if (skin) {
                skin.update(this.bones, mesh);
                mesh.updateAABB(skin);
            }
        });
    }
}
