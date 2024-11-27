import { vec4 } from "gl-matrix";
import { Camera } from "../Camera";
import { AmbientLight } from "../Light/AmbientLight";
import { DirectionalLight } from "../Light/DirectionalLight";
import { PointLight } from "../Light/PointLight";
import { Object } from "../Object";
import { DataTexture } from "../Programs/Texture/DataTexture";

export class Scene {
    private objects: Object[] = [];
    private camera: Camera;
    private directionalLight: DirectionalLight;
    private pointLights: PointLight[] = [];
    private ambientLight: AmbientLight;

    private pointLightsDataTexture: DataTexture | null;

    private pointLightsChanged = false;

    constructor(
        camera: Camera,
        directional: DirectionalLight,
        ambient: AmbientLight
    ) {
        this.setCamera(camera);
        this.directionalLight = directional;
        this.ambientLight = ambient;
    }

    public _setWebGl(webgl: WebGL2RenderingContext) {
        this.pointLightsDataTexture = new DataTexture(webgl);
        this.updatePointLightsDataTexture();
        this.objects.forEach((object) => {
            object._setWebGl(webgl);
        });
    }

    public _getPointLightsDataTexture() {
        return this.pointLightsDataTexture;
    }

    public addObject(object: Object) {
        this.objects.push(object);
    }

    public getObjects() {
        return this.objects;
    }

    public addPointLight(light: PointLight) {
        light.setOnUpdate(() => this.onUpdatePointLight());
        this.pointLights.push(light);
    }

    public getPointLights() {
        return this.pointLights;
    }

    public setCamera(camera: Camera) {
        this.camera = camera;
    }

    public getCamera() {
        return this.camera;
    }

    public getAmbientLight() {
        return this.ambientLight;
    }

    public getDirectionalLight() {
        return this.directionalLight;
    }

    public update(delta: number) {
        this.camera.update(delta);
        this.objects.forEach((object) => object.update());
    }

    private onUpdatePointLight() {
        this.updatePointLightsDataTexture();
    }

    private updatePointLightsDataTexture() {
        if (!this.pointLightsDataTexture) return null;

        const data: number[] = [];

        const lights = this.getPointLights();

        lights.forEach((light) => {
            const color = light.getColor() as number[];
            const position = light.getPosition() as number[];
            const bright = light.getBright();
            const { offset, scale } = light._getAtlas();

            data.push(
                ...(vec4.fromValues(
                    color[0],
                    color[1],
                    color[2],
                    1.0
                ) as number[]),
                ...(vec4.fromValues(
                    position[0],
                    position[1],
                    position[2],
                    bright
                ) as number[]),
                ...(vec4.fromValues(0, 0, 0, light.getFarPlane()) as number[]),
                ...(vec4.fromValues(
                    offset[0],
                    offset[1],
                    scale[0],
                    scale[1]
                ) as number[])
            );
        });

        const result = new Float32Array(data);

        // 1 texel - vec4(color, 1.0), 2 texel - vec4(position, bright), 3 texel - vec4(empty, farPlane);
        // 4 texel - vec4(vec2(atlasOffset), vec2(atlasScale))
        this.pointLightsDataTexture.setData(result, lights.length * 4, 1);
    }
}
