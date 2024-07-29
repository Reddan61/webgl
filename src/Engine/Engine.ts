import { glMatrix, mat4 } from "gl-matrix";

import { Camera } from "./Camera";
import { Object } from "./Object";

import { TriangleProgram } from "./Programs/TriangleProgram";
import { LineProgram } from "./Programs/LineProgram";

export interface EngineObjectGeometry {
    vertices: Float32Array;
    textureCoords: Float32Array;
    normals: Float32Array;
    indices: Uint16Array;
}

export interface EngineObjectAABB {
    vertices: Float32Array;
    indices: Uint16Array;
}

export interface EngineObjectMaterials {
    baseTexture: WebGLTexture;
}
interface EngineObjectContent {
    geometry: EngineObjectGeometry;
    aabb: EngineObjectAABB;
    materials: EngineObjectMaterials;
}

export interface EngineObject {
    content: EngineObjectContent[];
    object: Object;
}

export class Engine {
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
        this.camera = camera;

        const projection = new Float32Array(16);

        mat4.perspective(
            projection,
            glMatrix.toRadian(45),
            this.canvas.width / this.canvas.height,
            0.1,
            1000.0
        );

        this.triangleProgram = new TriangleProgram(
            this.webgl,
            projection,
            camera.getView()
        );
        this.lineProgram = new LineProgram(
            this.webgl,
            projection,
            camera.getView()
        );

        this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
        this.webgl.clear(
            this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );
        this.webgl.enable(this.webgl.DEPTH_TEST);
        this.webgl.depthFunc(this.webgl.LESS);
        this.enableCullFace();
    }

    public update(delta: number) {
        this.camera.update(delta);
        this.objects.forEach((engineObject) => engineObject.object.update());
    }

    public setShowAABB(bool: boolean) {
        this.showAABB = bool;
    }

    public addObject(object: Object) {
        const content: EngineObject["content"] = [];

        object.getContent().forEach(
            ({
                geometry: {
                    indices,
                    normals,
                    textureCoords,
                    vertices: { data: vertexData, max, min },
                },
                materials,
            }) => {
                content.push({
                    geometry: {
                        vertices: new Float32Array(vertexData),
                        normals: new Float32Array(normals),
                        textureCoords: new Float32Array(textureCoords),
                        indices: new Uint16Array(indices),
                    },
                    aabb: {
                        indices: new Uint16Array([
                            0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0,
                            4, 1, 5, 2, 6, 3, 7,
                        ]),
                        vertices: new Float32Array([
                            min[0],
                            min[1],
                            min[2],
                            max[0],
                            min[1],
                            min[2],
                            max[0],
                            max[1],
                            min[2],
                            min[0],
                            max[1],
                            min[2],
                            min[0],
                            min[1],
                            max[2],
                            max[0],
                            min[1],
                            max[2],
                            max[0],
                            max[1],
                            max[2],
                            min[0],
                            max[1],
                            max[2],
                        ]),
                    },
                    materials: {
                        baseTexture: this.createObjectTexture(
                            materials.baseTexture,
                            object.isFlipYTexture()
                        ),
                    },
                });
            }
        );

        const newObject: EngineObject = {
            object,
            content,
        };

        this.objects.push(newObject);
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

        this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
        this.webgl.clear(
            this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT
        );

        this.triangleProgram.useProgram();
        this.triangleProgram.updateView(this.camera.getView());

        this.objects.forEach((engineObject) => {
            if (engineObject.object.isSingleFace()) {
                this.disableCullFace();
            } else {
                this.enableCullFace();
            }

            engineObject.content.forEach(({ geometry, materials }) => {
                this.triangleProgram.setVariables(
                    engineObject,
                    geometry,
                    materials
                );
                this.triangleProgram.draw(geometry);
            });
        });

        if (this.showAABB) {
            this.lineProgram.useProgram();
            this.lineProgram.updateView(this.camera.getView());

            this.objects.forEach((engineObject) => {
                engineObject.content.forEach(({ aabb }) => {
                    this.lineProgram.setVariables(engineObject, aabb);
                    this.lineProgram.draw(aabb);
                });
            });
        }

        document.getElementById("fps").innerHTML = `${this.fpsToDraw} fps`;

        requestAnimationFrame(this.run);
    };

    // ---------private---------

    private canvas: HTMLCanvasElement | null = null;
    private webgl: WebGLRenderingContext | null = null;
    private triangleProgram: TriangleProgram = null;
    private lineProgram: LineProgram = null;

    private currentfps = 0;
    private fpsToDraw = 0;
    private lastFpsUpdate = 0;
    private lastTime = 0;

    private objects: EngineObject[] = [];
    private camera: Camera = null;

    private showAABB = false;

    private normalizeCanvas() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }

    private createObjectTexture(image: HTMLImageElement, flipY: boolean) {
        const texture = this.webgl.createTexture();
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
}
