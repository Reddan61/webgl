import { Camera } from "../Camera";
import { AmbientLight } from "../Light/AmbientLight";
import { DirectionalLight } from "../Light/DirectionalLight";
import { PointLight } from "../Light/PointLight";
import { Object } from "../Object";

export class Scene {
    private objects: Object[] = [];
    private camera: Camera;
    private directionalLight: DirectionalLight;
    private pointLights: PointLight[] = [];
    private ambientLight: AmbientLight;

    constructor(
        camera: Camera,
        directional: DirectionalLight,
        ambient: AmbientLight
    ) {
        this.setCamera(camera);
        this.directionalLight = directional;
        this.ambientLight = ambient;
    }

    public addObject(object: Object) {
        this.objects.push(object);
    }

    public getObjects() {
        return this.objects;
    }

    public addPointLight(light: PointLight) {
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
}
