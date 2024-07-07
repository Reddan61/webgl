import "./reset.scss"
import "./index.scss"

import { Engine } from "./Engine/Engine"
import { Camera } from "./Engine/Camera"
import { vec3 } from "gl-matrix"
import { Object } from "./Engine/Object"

import susanTexture from "../resources/SusanTexture.png"
import susan from "../resources/Susan.json"
import { loadImage } from "./Engine/Utils/Utils"

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

    const susanImage = await loadImage(susanTexture);

    const monkey1 = new Object(
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        [0, 0, 0],
        susanImage
    )
    const monkey2 = new Object(
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        [4, 1, 0],
        susanImage
    )
    const monkey3 = new Object(
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        [-4, 1, 0],
        susanImage
    )
    const monkey4 = new Object(
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        [0, 0, -4],
        susanImage
    )
    const monkey5 = new Object(
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        [4, 1, -4],
        susanImage
    )
    const monkey6 = new Object(
        susan.meshes[0].vertices,
        susan.meshes[0].faces.flat(Infinity),
        susan.meshes[0].texturecoords[0],
        susan.meshes[0].normals,
        [-4, 1, -4],
        susanImage
    )
    
    const camera = new Camera(cameraPosition);
    const engine = new Engine("canvas", camera);

    await engine.init();
    engine.addObject(monkey1);
    engine.addObject(monkey2);
    engine.addObject(monkey3);
    engine.addObject(monkey4);
    engine.addObject(monkey5);
    engine.addObject(monkey6);

	engine.run();
}

start();