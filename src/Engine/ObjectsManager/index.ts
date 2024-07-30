import { Object, ObjectContent } from "../Object";
import { ParsedGLTF } from "../Utils/GLTF";

export class ObjectsManager {
    public static getObjectFromParsedGLTF(parsed: ParsedGLTF): Object {
        const content: ObjectContent = parsed.map(({ geometry, materials }) => {
            return {
                geometry,
                materials: {
                    baseTexture: materials.baseTexture,
                    colorFactor: materials.colorFactor,
                },
            };
        });

        return new Object(content, [0, 0, 0], [1, 1, 1]);
    }
}
