import { vec3, vec4 } from "gl-matrix";

import { AmbientLight } from "engine/Light/AmbientLight/index";
import { DirectionalLight } from "engine/Light/DirectionalLight/index";
import { Camera } from "engine/Camera";
import { EngineObject } from "engine/EngineObject";
import { loadGLTF } from "engine/Utils/Utils";
import { MeshPrimitive } from "engine/MeshPrimitive";
import { Mesh } from "engine/Mesh";
import { Scene } from "engine/Scene";
import { PointLight } from "engine/Light/PointLight";
import { Material } from "engine/Material";
import { createSphere } from "engine/Utils/CreateObjects/createSphere";

import duckURL from "resources/duck/duck.gltf";
import shibaURL from "resources/shiba/shiba.gltf";
import wizardURL from "resources/wizard/scene.gltf";
import buildingURL from "resources/building/building.gltf";
import elephantURL from "resources/elephant/elephant.gltf";

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

    const pointLightObject = new EngineObject(
        [mesh],
        pointLight.getPosition(),
        [1, 1, 1]
    );

    return pointLightObject;
};

export const createSimpleScene = async () => {
    const cameraPosition = vec3.create();
    cameraPosition[0] = 0;
    cameraPosition[1] = 0;
    cameraPosition[2] = 5;

    const wizard = await loadGLTF(wizardURL);
    wizard.getTransform().getRotation().rotate(0, -90);
    wizard.getTransform().setPosition(vec3.fromValues(20, 0, 0));
    wizard.getTransform().setScaling(vec3.fromValues(10, 10, 10));
    wizard.setFlipYTexture(false);
    wizard.setName("wizard");

    const shiba = await loadGLTF(shibaURL);
    shiba.setFlipYTexture(false);
    shiba.getTransform().setPosition([0, 10, -21]);
    shiba.getTransform().setScaling([5, 5, 5]);
    shiba.setName("shiba");

    const duck = await loadGLTF(duckURL);
    duck.getTransform().setPosition([0, 0, -100]);
    duck.getTransform().setScaling([0.25, 0.25, 0.25]);
    duck.setFlipYTexture(false);
    duck.setName("duck");

    const building = await loadGLTF(buildingURL);
    building.getTransform().setPosition([0, 0, -500]);
    building.getTransform().setScaling([0.1, 0.1, 0.1]);
    building.setFlipYTexture(false);
    building.setName("building");

    const elephant = await loadGLTF(elephantURL);
    elephant.getTransform().setPosition([0, -10, -20]);
    elephant.getTransform().setScaling([0.15, 0.15, 0.15]);
    elephant.getTransform().getRotation().rotate(0, -90);
    elephant.setFlipYTexture(false);
    elephant.setName("elephant");

    const camera = new Camera(cameraPosition);
    const directionalLight = new DirectionalLight(
        vec3.fromValues(0, 2, 5),
        vec3.fromValues(1, 1, 1),
        0.8
    );
    const ambientLight = new AmbientLight(vec3.fromValues(1, 1, 1), 0.1);
    const pointLight1 = new PointLight(
        vec3.fromValues(-10, 0, 0),
        vec3.fromValues(0, 0, 1),
        1
    );
    const pointLight2 = new PointLight(
        vec3.fromValues(10, 0, 0),
        vec3.fromValues(1, 0, 1),
        0.5
    );

    const pointLightObject1 = createPointLight(pointLight1);
    const pointLightObject2 = createPointLight(pointLight2);

    const scene = new Scene(camera, directionalLight, ambientLight);

    scene.addPointLight(pointLight1);
    scene.addPointLight(pointLight2);

    scene.addObject(duck);
    scene.addObject(shiba);
    scene.addObject(building);
    scene.addObject(wizard);
    scene.addObject(elephant);
    scene.addObject(pointLightObject1);
    scene.addObject(pointLightObject2);

    return scene;
};
