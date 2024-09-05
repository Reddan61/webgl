import { mat4, vec3 } from "gl-matrix";

import { Rays } from "./Rays";
import { Camera } from "./Camera";
import { Object } from "./Object";

import { TriangleProgram } from "./Programs/TriangleProgram";
import { LineProgram } from "./Programs/LineProgram";
import { ObjectSelector } from "./ObjectSelector";

export class Engine {
    private canvas: HTMLCanvasElement;
    private webgl: WebGLRenderingContext;
    private triangleProgram: TriangleProgram;
    private lineProgram: LineProgram;

    private currentfps = 0;
    private fpsToDraw = 0;
    private lastFpsUpdate = 0;
    private lastTime = 0;

    private objects: Object[] = [];
    private camera: Camera;
    private objectSelector: ObjectSelector;

    private showAABB = false;
    private showRays = true;

    constructor(canvasId: string, camera: Camera) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        if (!canvas) {
            throw new Error("Canvas not found");
        }

        this.canvas = canvas;
        this.normalizeCanvas();

        const gl = canvas.getContext("webgl");

        if (!gl) {
            throw new Error("Unable to init webgl");
        }

        this.webgl = gl;
        camera.createProjection(this.canvas.width / this.canvas.height);
        this.camera = camera;

        this.objectSelector = new ObjectSelector(this.canvas, this.camera);

        this.triangleProgram = new TriangleProgram(
            this.webgl,
            this.camera.getProjection(),
            camera.getView()
        );
        this.lineProgram = new LineProgram(
            this.webgl,
            this.camera.getProjection(),
            camera.getView()
        );

        this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
        this.webgl.clear(
            this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );
        this.webgl.enable(this.webgl.DEPTH_TEST);
        this.webgl.depthFunc(this.webgl.LESS);
        this.enableCullFace();
        this.subscribe();
    }

    public update(delta: number) {
        this.camera.update(delta);
        this.objects.forEach((object) => object.update());
    }

    public setShowAABB(bool: boolean) {
        this.showAABB = bool;
    }

    public addObject(object: Object) {
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

        this.objects.push(object);
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

        this.triangleProgram.useProgram();
        this.triangleProgram.updateView(this.camera.getView());

        this.objects.forEach((object) => {
            if (object.isSingleFace()) {
                this.disableCullFace();
            } else {
                this.enableCullFace();
            }

            object.getMeshes().forEach((mesh) => {
                const primitives = mesh.getPrimitives();
                primitives.forEach((prim) => {
                    const material = prim.getMaterial();

                    const useTexture = Boolean(material.baseTexture);
                    const boneMatrices = mesh.getSkeleton()?.matrices;
                    const useBones = !!boneMatrices;

                    this.triangleProgram.setVariables({
                        useBones,
                        useTexture,
                        bonesMatrices: mesh.getSkeleton()?.matrices ?? null,
                        colorFactor: material.colorFactor,
                        texture: material.baseTexture,
                        indices: prim.getIndices(),
                        joints: prim.getJoints(),
                        normals: prim.getNormals(),
                        textureCoords: prim.getTextureCoords(),
                        vertices: prim.getVertices(),
                        weights: prim.getWeights(),
                        modelMatrix: object.getModelMatrix(),
                        normalMatrix: object.getNormalMatrix(),
                    });
                    this.triangleProgram.draw(prim.getIndices());
                });
            });
        });

        if (this.showAABB || this.showRays) {
            this.lineProgram.useProgram();
            this.lineProgram.updateView(this.camera.getView());
        }

        if (this.showAABB) {
            const selectedObject = this.objectSelector.getSelected();

            this.objects.forEach((object) => {
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
        const texture = this.webgl.createTexture() as WebGLTexture;

        this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
        this.webgl.pixelStorei(this.webgl.UNPACK_FLIP_Y_WEBGL, flipY);
        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_WRAP_S,
            this.webgl.CLAMP_TO_EDGE
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_WRAP_T,
            this.webgl.CLAMP_TO_EDGE
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_MIN_FILTER,
            this.webgl.LINEAR
        );
        this.webgl.texParameteri(
            this.webgl.TEXTURE_2D,
            this.webgl.TEXTURE_MAG_FILTER,
            this.webgl.LINEAR
        );

        this.webgl.texImage2D(
            this.webgl.TEXTURE_2D,
            0,
            this.webgl.RGBA,
            this.webgl.RGBA,
            this.webgl.UNSIGNED_BYTE,
            image
        );
        this.webgl.bindTexture(this.webgl.TEXTURE_2D, null);

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
                this.objectSelector.select(e.clientX, e.clientY, this.objects);
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (!this.isMouseDown) return;

            const selected = this.objectSelector.getSelected();

            if (selected) {
                const ray = Rays.RayCast(
                    e.clientX,
                    e.clientY,
                    this.canvas,
                    this.camera
                );

                const t = vec3.distance(
                    this.camera.getPosition(),
                    selected.object.getPosition()
                );

                const point = vec3.create();
                vec3.scaleAndAdd(
                    point,
                    this.camera.getPosition(),
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
                    this.camera
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
