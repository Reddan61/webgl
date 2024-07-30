import "./reset.scss";
import "./index.scss";

import { Engine } from "./Engine/Engine";
import { Camera } from "./Engine/Camera";
import { vec3 } from "gl-matrix";
import { Object, ObjectContent } from "./Engine/Object";
import { loadGLTF, loadImage, loadObj } from "./Engine/Utils/Utils";

import susURL from "../resources/sus.obj";
import susTexture from "../resources/sus.png";
import duckURL from "../resources/duck/duck.gltf";
import shibaURL from "../resources/shiba/shiba.gltf";
import buildingURL from "../resources/building/building.gltf";
import axisURL from "../resources/axis/axis.gltf";
import { ObjectsManager } from "./Engine/ObjectsManager";
// import msssingTexture from "../resources/missing.png"

const controls = document.getElementById("controls");

if (controls) {
    controls.addEventListener("click", () => {
        alert(`
            Передвижение: WASD + Space + Shift
            Осмотр: стрелочки или движение мыши с зажатой левой кнопкой    
        `);
    });
}

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
    const axisParsed = await loadGLTF(axisURL);

    const axis = ObjectsManager.getObjectFromParsedGLTF(axisParsed);
    axis.setPosition([20, 0, 0]);

    const shiba1 = ObjectsManager.getObjectFromParsedGLTF(shibaParsed);
    shiba1.rotate(-90, 0);
    shiba1.setFlipYTexture(false);
    const shiba2 = ObjectsManager.getObjectFromParsedGLTF(shibaParsed);
    shiba2.setPosition([5, 0, 0]);
    shiba2.setScaling([2, 2, 2]);
    shiba2.rotate(-90, 0);
    shiba2.setFlipYTexture(false);
    const shiba3 = ObjectsManager.getObjectFromParsedGLTF(shibaParsed);
    shiba3.setPosition([10, 0, 0]);
    shiba3.setScaling([3, 3, 3]);
    shiba3.rotate(-90, 0);
    shiba3.setFlipYTexture(false);

    const duck1 = ObjectsManager.getObjectFromParsedGLTF(duckParsed);
    duck1.setPosition([-150, 0, 0]);
    duck1.setScaling([0.5, 0.5, 0.5]);
    duck1.rotate(-90, 90);
    duck1.setFlipYTexture(false);
    const duck2 = ObjectsManager.getObjectFromParsedGLTF(duckParsed);
    duck2.setPosition([0, 10, -15]);
    duck2.setScaling([0.02, 0.02, 0.02]);
    duck2.rotate(-90, 0);
    duck2.setFlipYTexture(false);

    const building1 = ObjectsManager.getObjectFromParsedGLTF(buildingParsed);
    building1.setPosition([0, 0, -500]);
    building1.setScaling([0.1, 0.1, 0.1]);
    building1.rotate(-90, 0);
    building1.setFlipYTexture(false);

    const sus = new Object(
        [
            {
                geometry: susParsed,
                materials: {
                    colorFactor: [1, 1, 1, 1],
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
    engine.addObject(axis);

    engine.run();

    const aabbElement = document.getElementById("aabb");

    if (aabbElement) {
        aabbElement.addEventListener("change", (e) => {
            const target = e.target as HTMLInputElement;
            const checked = target.checked;
            engine.setShowAABB(checked);
            target.blur();
        });
    }
};

start();
