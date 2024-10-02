import { AmbientLight } from "./Engine/Light/AmbientLight/index";
import { DirectionalLight } from "./Engine/Light/DirectionalLight/index";
import "./reset.scss";
import "./index.scss";

import { Engine } from "./Engine/Engine";
import { Camera } from "./Engine/Camera";
import { vec3, vec4 } from "gl-matrix";
import { Object } from "./Engine/Object";
import {
    createSphere,
    loadGLTF,
    loadImage,
    loadObj,
} from "./Engine/Utils/Utils";

import susURL from "../resources/sus.obj";
import susTexture from "../resources/sus.png";
import duckURL from "../resources/duck/duck.gltf";
import shibaURL from "../resources/shiba/shiba.gltf";
import buildingURL from "../resources/building/building.gltf";
import axisURL from "../resources/axis/axis.gltf";
import elephantURL from "../resources/elephant/elephant.gltf";
import { ObjectsManager } from "./Engine/ObjectsManager";
import { MeshPrimitive } from "./Engine/MeshPrimitive";
import { Mesh } from "./Engine/Mesh";
import { Scene } from "./Engine/Scene";
import { PointLight } from "./Engine/Light/PointLight";
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

const createPointLight = (pointLight: PointLight) => {
    const sphere = createSphere(2, 15);
    const lightColor = pointLight.getColor();
    const mesh = new Mesh([
        new MeshPrimitive(
            {
                indices: sphere.indices,
                normals: sphere.normals,
                textureCoords: [],
                vertices: {
                    data: sphere.vertices,
                    max: sphere.max as number[],
                    min: sphere.min as number[],
                },
            },
            {
                baseImage: null,
                colorFactor: vec4.fromValues(
                    lightColor[0],
                    lightColor[1],
                    lightColor[2],
                    1
                ),
            }
        ),
    ]);
    mesh.setLight(pointLight);

    const pointLightObject = new Object(
        [mesh],
        pointLight.getPosition(),
        [1, 1, 1]
    );

    return pointLightObject;
};

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
    const elephantParsed = await loadGLTF(elephantURL);

    const axis = ObjectsManager.getObjectsFromParsedGLTF(axisParsed)[0];
    axis.setPosition([20, 0, 0]);

    const shiba1 = ObjectsManager.getObjectsFromParsedGLTF(shibaParsed)[0];
    shiba1.rotate(-90, 0);
    shiba1.setFlipYTexture(false);
    const shiba2 = ObjectsManager.getObjectsFromParsedGLTF(shibaParsed)[0];
    shiba2.setPosition([5, 0, 0]);
    shiba2.setScaling([2, 2, 2]);
    shiba2.rotate(-90, 0);
    shiba2.setFlipYTexture(false);
    const shiba3 = ObjectsManager.getObjectsFromParsedGLTF(shibaParsed)[0];
    shiba3.setPosition([10, 0, 0]);
    shiba3.setScaling([3, 3, 3]);
    shiba3.rotate(-90, 0);
    shiba3.setFlipYTexture(false);

    const duck1 = ObjectsManager.getObjectsFromParsedGLTF(duckParsed)[0];
    duck1.setPosition([-150, 0, 0]);
    duck1.setScaling([0.5, 0.5, 0.5]);
    duck1.rotate(-90, 90);
    duck1.setFlipYTexture(false);
    const duck2 = ObjectsManager.getObjectsFromParsedGLTF(duckParsed)[0];
    duck2.setPosition([0, 10, -15]);
    duck2.setScaling([0.02, 0.02, 0.02]);
    duck2.rotate(-90, 0);
    duck2.setFlipYTexture(false);

    const building1 =
        ObjectsManager.getObjectsFromParsedGLTF(buildingParsed)[0];
    building1.setPosition([0, 0, -500]);
    building1.setScaling([0.1, 0.1, 0.1]);
    building1.rotate(-90, 0);
    building1.setFlipYTexture(false);

    const elephant1 =
        ObjectsManager.getObjectsFromParsedGLTF(elephantParsed)[0];
    elephant1.setPosition([0, -10, -20]);
    elephant1.setScaling([0.15, 0.15, 0.15]);
    elephant1.rotate(0, -90);
    elephant1.setFlipYTexture(false);

    const primitvies = [
        new MeshPrimitive(
            {
                indices: susParsed.indices,
                normals: susParsed.normals,
                textureCoords: susParsed.textureCoords,
                vertices: susParsed.vertices,
            },
            {
                colorFactor: [1, 1, 1, 1],
                baseImage: susImage,
            }
        ),
    ];

    const meshes = [new Mesh(primitvies)];

    const sus = new Object(meshes, [0, 0, 5], [1, 1, 1]);

    const camera = new Camera(cameraPosition);
    const directionalLight = new DirectionalLight(
        vec3.fromValues(0, 2, 5),
        vec3.fromValues(1, 1, 1),
        0.8
    );
    const ambientLight = new AmbientLight(vec3.fromValues(1, 1, 1), 0.1);

    const pointLight1 = new PointLight(
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 0, 1),
        1
    );
    const pointLight2 = new PointLight(
        vec3.fromValues(10, 0, 0),
        vec3.fromValues(1, 0, 1),
        0.5
    );
    const pointLight3 = new PointLight(
        vec3.fromValues(0, 7, -22),
        vec3.fromValues(1, 1, 1),
        0.5
    );

    const pointLightObject1 = createPointLight(pointLight1);
    const pointLightObject2 = createPointLight(pointLight2);
    const pointLightObject3 = createPointLight(pointLight3);

    const scene = new Scene(camera, directionalLight, ambientLight);

    scene.addPointLight(pointLight1);
    scene.addPointLight(pointLight2);
    scene.addPointLight(pointLight3);

    scene.addObject(sus);
    scene.addObject(duck1);
    scene.addObject(duck2);
    scene.addObject(shiba1);
    scene.addObject(shiba2);
    scene.addObject(shiba3);
    scene.addObject(building1);
    scene.addObject(axis);
    scene.addObject(elephant1);
    scene.addObject(pointLightObject1);
    scene.addObject(pointLightObject2);
    scene.addObject(pointLightObject3);

    const engine = new Engine("canvas", scene);

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
