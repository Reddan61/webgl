import { mat4, vec3 } from "gl-matrix";

import { Rays } from "./Rays";

import { TriangleProgram } from "./Programs/TriangleProgram";
import { LineProgram } from "./Programs/LineProgram";
import { ObjectSelector } from "./ObjectSelector";
import { Scene } from "./Scene";
import { ImageTexture } from "./Programs/Texture/ImageTexture";

export class Engine {
    private canvas: HTMLCanvasElement;
    private webgl: WebGL2RenderingContext;
    private triangleProgram: TriangleProgram;
    private lineProgram: LineProgram;

    private currentfps = 0;
    private fpsToDraw = 0;
    private lastFpsUpdate = 0;
    private lastTime = 0;

    private scene: Scene;
    private objectSelector: ObjectSelector;

    private showAABB = false;
    private showRays = true;

    constructor(canvasId: string, scene: Scene) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        if (!canvas) {
            throw new Error("Canvas not found");
        }

        this.canvas = canvas;
        this.normalizeCanvas();

        const gl = canvas.getContext("webgl2");

        if (!gl) {
            throw new Error("Unable to init webgl2");
        }

        this.webgl = gl;
        this.scene = scene;
        this.scene._setWebGl(this.webgl);

        const camera = this.scene.getCamera();
        camera.createProjection(this.canvas.width / this.canvas.height);

        this.objectSelector = new ObjectSelector(this.canvas, camera);

        this.triangleProgram = new TriangleProgram(
            this.webgl,
            camera.getProjection(),
            camera.getView()
        );
        this.lineProgram = new LineProgram(
            this.webgl,
            camera.getProjection(),
            camera.getView()
        );

        this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
        this.webgl.clear(
            this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );
        this.webgl.enable(this.webgl.DEPTH_TEST);
        this.webgl.depthFunc(this.webgl.LESS);
        this.enableCullFace();
        this.generateTexturesForObjects();
        this.subscribe();
    }

    public update(delta: number) {
        this.scene.update(delta);
    }

    public setShowAABB(bool: boolean) {
        this.showAABB = bool;
    }

    private generateTexturesForObjects() {
        this.scene.getObjects().forEach((object) => {
            object.getMeshes().forEach((mesh) => {
                const primitives = mesh.getPrimitives();
                primitives.forEach((prim) => {
                    const material = prim.getMaterial();

                    if (!material.baseImage) return;

                    const texture = this.createObjectTexture(
                        material.baseImage,
                        object.isFlipYTexture()
                    );

                    prim.setTexture(texture);
                });
            });
        });
    }

    public run = () => {
        const currentTime = performance.now() / 1000;
        const delta = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.currentfps++;

        if (currentTime - this.lastFpsUpdate >= 1.0) {
            this.fpsToDraw = this.currentfps;
            this.currentfps = 0;
            this.lastFpsUpdate += 1.0;
        }

        this.update(delta);

        this.clear();

        const camera = this.scene.getCamera();
        const objects = this.scene.getObjects();

        this.triangleProgram.useProgram();
        this.triangleProgram.updateView(camera.getView());

        objects.forEach((object) => {
            if (object.isSingleFace()) {
                this.disableCullFace();
            } else {
                this.enableCullFace();
            }

            object.getMeshes().forEach((mesh) => {
                const isLight = Boolean(mesh.getLight());
                const primitives = mesh.getPrimitives();
                primitives.forEach((prim) => {
                    const material = prim.getMaterial();

                    const useTexture = Boolean(material.baseTexture);
                    const boneMatrices = mesh.getSkeleton()?.matrices;
                    const useBones = !!boneMatrices;

                    this.triangleProgram.setVariables({
                        useBones,
                        scene: this.scene,
                        useTexture,
                        useLight: !isLight,
                        bonesMatrices: mesh.getSkeleton()?.matrices ?? null,
                        colorFactor: material.colorFactor,
                        objectTexture: material.baseTexture,
                        indices: prim.getIndices(),
                        joints: prim.getJoints(),
                        normals: prim.getNormals(),
                        textureCoords: prim.getTextureCoords(),
                        vertices: prim.getVertices(),
                        weights: prim.getWeights(),
                        modelMatrix: object.getModelMatrix(),
                        normalMatrix: object.getNormalMatrix(),
                        cameraPosition: new Float32Array(camera.getPosition()),
                    });
                    this.triangleProgram.draw(prim.getIndices());
                });
            });
        });

        if (this.showAABB || this.showRays) {
            this.lineProgram.useProgram();
            this.lineProgram.updateView(camera.getView());
        }

        if (this.showAABB) {
            const selectedObject = this.objectSelector.getSelected();

            objects.forEach((object) => {
                const modelMatrix = object.getModelMatrix();
                const isSelected = selectedObject?.object === object;

                const aabb = object.getAABB();
                const aabbIndices = aabb.getIndices();

                this.lineProgram.setVariables(
                    aabb.getVertices(),
                    aabbIndices,
                    modelMatrix,
                    isSelected ? [1.0, 0.0, 0.0, 1.0] : [0.0, 1.0, 0.0, 1.0]
                );
                this.lineProgram.draw(aabbIndices);
            });
        }

        if (this.showRays) {
            const rays = this.objectSelector.getRays();
            const modelMatrix = mat4.create();
            mat4.identity(modelMatrix);

            rays.forEach((ray) => {
                const lineToDraw = ray.getLine();
                this.lineProgram.setVariables(
                    lineToDraw.vertices,
                    lineToDraw.indices,
                    modelMatrix,
                    [0.0, 0.0, 1.0, 1.0]
                );

                this.lineProgram.draw(lineToDraw.indices);
            });
        }

        const fpsElement = document.getElementById("fps");

        if (fpsElement) {
            fpsElement.innerHTML = `${this.fpsToDraw} fps`;
        }

        requestAnimationFrame(this.run);
    };

    private normalizeCanvas() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }

    private clear() {
        // this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
        this.webgl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.webgl.clear(
            this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );
    }

    private createObjectTexture(image: HTMLImageElement, flipY: boolean) {
        const texture = new ImageTexture(this.webgl, image, flipY);

        return texture;
    }

    private enableCullFace() {
        this.webgl.enable(this.webgl.CULL_FACE);
        this.webgl.frontFace(this.webgl.CCW);
        this.webgl.cullFace(this.webgl.BACK);
    }

    private disableCullFace() {
        this.webgl.disable(this.webgl.CULL_FACE);
    }

    private isMouseDown = false;

    private subscribe() {
        this.canvas.addEventListener("mousedown", (e) => {
            const isLeftClick = e.button === 0;

            if (isLeftClick) {
                this.isMouseDown = true;
                this.objectSelector.select(
                    e.clientX,
                    e.clientY,
                    this.scene.getObjects()
                );
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (!this.isMouseDown) return;

            const selected = this.objectSelector.getSelected();

            if (selected) {
                const camera = this.scene.getCamera();

                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    this.canvas,
                    camera
                );

                const t = vec3.distance(
                    camera.getPosition(),
                    selected.object.getPosition()
                );

                const point = vec3.create();
                vec3.scaleAndAdd(
                    point,
                    camera.getPosition(),
                    ray.getDirection(),
                    t
                );

                selected.object.setPosition(point);
            }
        });

        this.canvas.addEventListener("mouseup", (e) => {
            this.objectSelector.clear();
            this.isMouseDown = false;
        });

        this.canvas.addEventListener("wheel", (e) => {
            const selected = this.objectSelector.getSelected();

            if (selected) {
                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    this.canvas,
                    this.scene.getCamera()
                );
                const deltaY = e.deltaY * -0.01;

                const point = vec3.create();
                vec3.scaleAndAdd(
                    point,
                    selected.object.getPosition(),
                    ray.getDirection(),
                    deltaY
                );

                selected.object.setPosition(point);
            }
        });
    }
}
