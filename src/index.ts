import { AmbientLight } from "./Engine/Light/AmbientLight/index";
import { DirectionalLight } from "./Engine/Light/DirectionalLight/index";
import "./reset.scss";
import "./index.scss";

import { Camera } from "./Engine/Camera";
import { vec3, vec4 } from "gl-matrix";
import { Object } from "./Engine/Object";
import { createSphere, loadGLTF } from "./Engine/Utils/Utils";

// import susURL from "../resources/sus.obj";
// import susTexture from "../resources/sus.png";
import duckURL from "../resources/duck/duck.gltf";
import shibaURL from "../resources/shiba/shiba.gltf";
import wizardURL from "../resources/wizard/scene.gltf";
import buildingURL from "../resources/building/building.gltf";
import axisURL from "../resources/axis/axis.gltf";
import elephantURL from "../resources/elephant/elephant.gltf";
import { MeshPrimitive } from "./Engine/MeshPrimitive";
import { Mesh } from "./Engine/Mesh";
import { Scene } from "./Engine/Scene";
import { PointLight } from "./Engine/Light/PointLight";
import { Material } from "./Engine/Material";
import { Engine } from "./Engine/Engine";
// import msssingTexture from "../resources/missing.png"

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
            new Material({
                color: vec4.fromValues(
                    lightColor[0],
                    lightColor[1],
                    lightColor[2],
                    1
                ),
            })
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

const createScene = async () => {
    const cameraPosition = vec3.create();
    cameraPosition[0] = 0;
    cameraPosition[1] = 0;
    cameraPosition[2] = 5;

    // const missingImage = await loadImage(msssingTexture);
    // const susImage = await loadImage(susTexture);

    // const susParsed = await loadObj(susURL);

    const wizard = await loadGLTF(wizardURL);
    wizard.rotate(0, -90);
    wizard.setPosition(vec3.fromValues(20, 0, 0));
    wizard.setScaling(vec3.fromValues(10, 10, 10));
    wizard.setFlipYTexture(false);
    wizard.setName("wizard");

    // const axis = await loadGLTF(axisURL);
    // axis.setPosition([20, 0, 0]);

    const shiba = await loadGLTF(shibaURL);
    shiba.setFlipYTexture(false);
    shiba.setPosition([0, 4, -21]);
    shiba.setName("shiba");

    // const shiba2 = ObjectsManager.getObjectsFromParsedGLTF(shibaParsed)[0];
    // shiba2.setPosition([5, 0, 0]);
    // shiba2.setScaling([2, 2, 2]);
    // shiba2.rotate(-90, 0);
    // shiba2.setFlipYTexture(false);
    // const shiba3 = ObjectsManager.getObjectsFromParsedGLTF(shibaParsed)[0];
    // shiba3.setPosition([10, 0, 0]);
    // shiba3.setScaling([3, 3, 3]);
    // shiba3.rotate(-90, 0);
    // shiba3.setFlipYTexture(false);

    const duck = await loadGLTF(duckURL);
    duck.setPosition([0, 0, -100]);
    duck.setScaling([0.25, 0.25, 0.25]);
    duck.setFlipYTexture(false);
    duck.setName("duck");

    // const duck2 = ObjectsManager.getObjectsFromParsedGLTF(duckParsed)[0];
    // duck2.setPosition([0, 10, -15]);
    // duck2.setScaling([0.02, 0.02, 0.02]);
    // duck2.rotate(-90, 0);
    // duck2.setFlipYTexture(false);

    const building = await loadGLTF(buildingURL);
    building.setPosition([0, 0, -500]);
    building.setScaling([0.1, 0.1, 0.1]);
    building.setFlipYTexture(false);
    building.setName("building");

    const elephant = await loadGLTF(elephantURL);
    elephant.setPosition([0, -10, -20]);
    elephant.setScaling([0.15, 0.15, 0.15]);
    elephant.rotate(0, -90);
    elephant.setFlipYTexture(false);
    elephant.setName("elephant");

    // const primitvies = [
    //     new MeshPrimitive(
    //         {
    //             indices: susParsed.indices,
    //             normals: susParsed.normals,
    //             textureCoords: susParsed.textureCoords,
    //             vertices: susParsed.vertices,
    //         },
    //         {
    //             colorFactor: [1, 1, 1, 1],
    //             baseImage: susImage,
    //         }
    //     ),
    // ];

    // const meshes = [new Mesh(primitvies)];

    // const sus = new Object(meshes, [0, 0, 5], [1, 1, 1]);

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
    // const pointLight4 = new PointLight(
    //     vec3.fromValues(-10, 7, -22),
    //     vec3.fromValues(1, 1, 1),
    //     0.5
    // );

    // const pointLight5 = new PointLight(
    //     vec3.fromValues(-15, 7, -22),
    //     vec3.fromValues(1, 1, 1),
    //     0.5
    // );

    const pointLightObject1 = createPointLight(pointLight1);
    const pointLightObject2 = createPointLight(pointLight2);
    const pointLightObject3 = createPointLight(pointLight3);
    // const pointLightObject4 = createPointLight(pointLight4);
    // const pointLightObject5 = createPointLight(pointLight5);

    const scene = new Scene(camera, directionalLight, ambientLight);

    scene.addPointLight(pointLight1);
    scene.addPointLight(pointLight2);
    scene.addPointLight(pointLight3);
    // scene.addPointLight(pointLight4);
    // scene.addPointLight(pointLight5);

    // scene.addObject(sus);
    scene.addObject(duck);
    // scene.addObject(duck2);
    scene.addObject(shiba);
    // scene.addObject(shiba2);
    // scene.addObject(shiba3);
    scene.addObject(building);
    // scene.addObject(axis);
    scene.addObject(wizard);
    scene.addObject(elephant);
    scene.addObject(pointLightObject1);
    scene.addObject(pointLightObject2);
    scene.addObject(pointLightObject3);
    // scene.addObject(pointLightObject4);
    // scene.addObject(pointLightObject5);

    return scene;
};

const start = async () => {
    const scene = await createScene();

    Engine.Init();
    Engine.setScene(scene);
    Engine.run();
};

start();
