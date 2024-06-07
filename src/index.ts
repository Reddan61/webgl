import "./reset.scss"
import "./index.scss"

import { Engine } from "./Engine/Engine"
import { Camera } from "./Engine/Camera/Camera"
import { vec3 } from "gl-matrix"

const start = async () => {
    const cameraPosition = vec3.create();
    cameraPosition[0] = 0;
    cameraPosition[1] = 0;
    cameraPosition[2] = 5;

    const camera = new Camera(cameraPosition);
    const engine = new Engine("canvas", camera);
    await engine.init();

	engine.run();
}

start();