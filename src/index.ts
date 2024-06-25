import "./reset.scss"
import "./index.scss"

import { Engine } from "./Engine/Engine"
import { Camera } from "./Engine/Camera"
import { vec3 } from "gl-matrix"
import { Object } from "./Engine/Object"

import susanTexture from "../resources/SusanTexture.png"
import susan from "../resources/Susan.json"

const start = async () => {
    const cameraPosition = vec3.create();
    cameraPosition[0] = 0;
    cameraPosition[1] = 0;
    cameraPosition[2] = 5;
    
    const object1 = new Object(
        [0, 0, 0], 
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        susanTexture
    );
    const object2 = new Object(
        [4, 1, 0], 
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        susanTexture
    );
    const object3 = new Object(
        [-4, 1, 0], 
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        susanTexture
    );
    const camera = new Camera(cameraPosition);
    const engine = new Engine("canvas", camera);

    engine.addObject(object1);
    engine.addObject(object2);
    engine.addObject(object3);

    await engine.init();

	engine.run();
}

start();