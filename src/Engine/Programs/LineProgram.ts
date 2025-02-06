import { mat4, vec4 } from "gl-matrix";
import { Program } from "./Program";
import { vertexShader } from "../shaders/lines/vertex";
import { fragmentShader } from "../shaders/lines/fragment";
import { ArrayBuffer } from "./Buffer/ArrayBuffer";
import { ElementBuffer } from "./Buffer/ElementBuffer";
import { UniformMatrix4fv } from "./Uniform/UniformMatrix4fv";
import { Uniform4fv } from "./Uniform/Uniform4fv";
import { Scene } from "../Scene";
import { Camera } from "../Camera";
import { Engine } from "../Engine";

export type LineProgramVertices = Float32Array;
export type LineProgramIndices = Uint16Array;

export class LineProgram extends Program {
    private vertexBuffer: ArrayBuffer;
    private indicesBuffer: ElementBuffer;

    private transformationMatUniform: UniformMatrix4fv;
    private projectionMatUniform: UniformMatrix4fv;
    private viewMatUniform: UniformMatrix4fv;
    private colorUniform: Uniform4fv;

    constructor(webgl: WebGL2RenderingContext) {
        super(webgl);
        this.Init(vertexShader, fragmentShader);
        super.useProgram();
        this.initBuffers();
        this.matrixInit();
    }

    public draw(scene: Scene) {
        this.useProgram();
        this.updateView(scene.getCamera().getView());
        const objectSelector = Engine.getObjectSelector();

        const selectedObject = objectSelector.getSelected();
        const objects = scene.getObjects();
        const camera = scene.getCamera();

        objects.forEach((object) => {
            const modelMatrix = object.getTransform().getModelMatrix();
            const isSelected = selectedObject?.entity?.object === object;

            const aabb = object.getAABB();
            const aabbIndices = aabb.getIndices();

            this.setVariables(
                aabb.getVertices(),
                aabbIndices,
                modelMatrix,
                isSelected ? [1.0, 0.0, 0.0, 1.0] : [0.0, 1.0, 0.0, 1.0],
                camera
            );

            this.webgl.drawElements(
                this.webgl.LINES,
                aabbIndices.length,
                this.webgl.UNSIGNED_SHORT,
                0
            );
        });

        const rays = objectSelector.getRays();

        const modelMatrix = mat4.create();
        mat4.identity(modelMatrix);

        rays.forEach((ray) => {
            const lineToDraw = ray.getLine();
            this.setVariables(
                lineToDraw.vertices,
                lineToDraw.indices,
                modelMatrix,
                [0.0, 0.0, 1.0, 1.0],
                camera
            );

            this.webgl.drawElements(
                this.webgl.LINES,
                lineToDraw.indices.length,
                this.webgl.UNSIGNED_SHORT,
                0
            );
        });
    }

    public updateView(view: mat4) {
        this.viewMatUniform.setData(view);
    }

    public useProgram() {
        super.useProgram();
        this.setAttributes();
    }

    private setAttributes() {
        this.vertexBuffer.setAttributes();
    }

    private initBuffers() {
        this.vertexBuffer = new ArrayBuffer(
            this.webgl,
            this.program,
            "vertexPosition",
            3,
            this.webgl.FLOAT
        );
        this.indicesBuffer = new ElementBuffer(this.webgl);

        this.setAttributes();
    }

    private matrixInit() {
        this.viewMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "view"
        );
        this.transformationMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "transformation"
        );

        this.projectionMatUniform = new UniformMatrix4fv(
            this.webgl,
            this.program,
            "projection"
        );
        this.colorUniform = new Uniform4fv(this.webgl, this.program, "color");
    }

    private setVariables(
        vertices: LineProgramVertices,
        indices: LineProgramIndices,
        modelMatrix: mat4,
        color: vec4,
        camera: Camera
    ) {
        this.viewMatUniform.setData(camera.getView());
        this.projectionMatUniform.setData(camera.getProjection());

        this.vertexBuffer.setBufferData(vertices);
        this.indicesBuffer.setBufferData(indices);

        this.transformationMatUniform.setData(modelMatrix);
        this.colorUniform.setData(color);
    }
}
