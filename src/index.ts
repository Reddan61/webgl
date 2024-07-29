import "./reset.scss";
import "./index.scss";

import { Engine } from "./Engine/Engine";
import { Camera } from "./Engine/Camera";
import { vec3 } from "gl-matrix";
import { Object } from "./Engine/Object";
import { loadGLTF, loadImage, loadObj } from "./Engine/Utils/Utils";

import susURL from "../resources/sus.obj";
import susTexture from "../resources/sus.png";
import duckURL from "../resources/duck/duck.gltf";
import shibaURL from "../resources/shiba/shiba.gltf";
import buildingURL from "../resources/building/building.gltf";
// import msssingTexture from "../resources/missing.png"

document.getElementById("controls").addEventListener("click", () => {
    alert(`
        Передвижение: WASD + Space + Shift
        Осмотр: стрелочки или движение мыши с зажатой левой кнопкой    
    `);
});

const start = async () => {
    const cameraPosition = vec3.create();
    cameraPosition[0] = 0;
    cameraPosition[1] = 0;
    cameraPosition[2] = 5;

    // const missingImage = await loadImage(msssingTexture);
    const susImage = await loadImage(susTexture);

    const susParsed = await loadObj(susURL);

    const duckParsed = await loadGLTF(duckURL);
    const shibaParsed = await loadGLTF(shibaURL);
    const buildingParsed = await loadGLTF(buildingURL);

    const shiba1 = new Object(shibaParsed, [0, 0, 0], [1, 1, 1]);
    shiba1.rotate(-90, 0);
    shiba1.setFlipYTexture(false);
    const shiba2 = new Object(shibaParsed, [5, 0, 0], [2, 2, 2]);
    shiba2.rotate(-90, 0);
    shiba2.setFlipYTexture(false);
    const shiba3 = new Object(shibaParsed, [10, 0, 0], [3, 3, 3]);
    shiba3.rotate(-90, 0);
    shiba3.setFlipYTexture(false);
    const duck1 = new Object(duckParsed, [-150, 0, 0], [0.5, 0.5, 0.5]);
    duck1.rotate(-90, 90);
    duck1.setFlipYTexture(false);
    const duck2 = new Object(duckParsed, [0, 10, -15], [0.02, 0.02, 0.02]);
    duck2.rotate(-90, 0);
    duck2.setFlipYTexture(false);
    const building1 = new Object(buildingParsed, [0, 0, -500], [0.1, 0.1, 0.1]);
    building1.rotate(-90, 0);
    building1.setFlipYTexture(false);

    const sus = new Object(
        [
            {
                geometry: susParsed,
                materials: {
                    baseTexture: susImage,
                },
            },
        ],
        [0, 0, 5],
        [1, 1, 1]
    );

    const camera = new Camera(cameraPosition);
    const engine = new Engine("canvas", camera);

    engine.addObject(sus);
    engine.addObject(duck1);
    engine.addObject(duck2);
    engine.addObject(shiba1);
    engine.addObject(shiba2);
    engine.addObject(shiba3);
    engine.addObject(building1);

    engine.run();

    document.getElementById("aabb").addEventListener("change", (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        engine.setShowAABB(checked);
    });
};

start();
