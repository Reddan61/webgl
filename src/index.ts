import "./reset.scss"
import "./index.scss"

import { Engine } from "./Engine/Engine"
import { Camera } from "./Engine/Camera"
import { vec3 } from "gl-matrix"
import { Object } from "./Engine/Object"

import susanTexture from "../resources/SusanTexture.png"
import susan from "../resources/Susan.json"
import { ObjectGroup } from "./Engine/ObjectGroup"

const start = async () => {
    const cameraPosition = vec3.create();
    cameraPosition[0] = 0;
    cameraPosition[1] = 0;
    cameraPosition[2] = 5;

    const monkeyGroup = new ObjectGroup(
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        susanTexture
    );

    await monkeyGroup.init();

    monkeyGroup.addObject(
        new Object(
            [0, 0, 0]
        )
    );
    monkeyGroup.addObject(
        new Object(
            [4, 1, 0]
        )
    );
    monkeyGroup.addObject(
        new Object(
            [-4, 1, 0]
        )
    );

    monkeyGroup.addObject(
        new Object(
            [0, 0, -4]
        )
    );
    monkeyGroup.addObject(
        new Object(
            [4, 1, -4]
        )
    );
    monkeyGroup.addObject(
        new Object(
            [-4, 1, -4]
        )
    );
    
    const camera = new Camera(cameraPosition);
    const engine = new Engine("canvas", camera);

    engine.addObjectGroup(monkeyGroup);

    await engine.init();

	engine.run();
}

start();