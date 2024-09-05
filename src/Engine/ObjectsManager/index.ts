import { Mesh } from "../Mesh";
import { MeshPrimitive } from "../MeshPrimitive";
import { Object } from "../Object";
import { ParsedGLTF } from "../Utils/GLTF";

export class ObjectsManager {
    public static getObjectsFromParsedGLTF(parsed: ParsedGLTF): Object[] {
        const objects: Object[] = parsed.meshes
            .map((meshes) => {
                return meshes.reduce((prev, { primitives, skeleton }) => {
                    const customPrimitives = primitives.map(
                        ({ geometry, materials }) => {
                            return new MeshPrimitive(geometry, {
                                baseImage: materials.baseTexture,
                                colorFactor: materials.colorFactor,
                            });
                        }
                    );

                    const mesh = new Mesh(
                        customPrimitives,
                        skeleton,
                        parsed.bones
                    );

                    prev.push(mesh);

                    return prev;
                }, [] as Mesh[]);
            })
            .reduce((prev, cur) => {
                const object = new Object(
                    cur,
                    [0, 0, 0],
                    [1, 1, 1],
                    parsed.bones,
                    parsed.bonesAnimations ?? []
                );

                prev.push(object);

                return prev;
            }, [] as Object[]);

        return objects;
    }
}
