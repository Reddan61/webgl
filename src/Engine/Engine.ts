import { glMatrix, mat4 } from "gl-matrix"

import { Camera } from './Camera';
import { Object } from './Object';

import { vertexShader } from "./shaders/vertex";
import { fragmentShader } from "./shaders/fragment"


interface EngineObject {
	texture: WebGLTexture,
	vertices: Float32Array;
	textureCoords: Float32Array;
	normals: Float32Array;
	indices: Uint16Array;
	object: Object;
}

export class Engine {
  constructor(canvasId: string, camera: Camera) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement

	if (!canvas) {
      throw new Error("Canvas not found")
    }

    this.canvas = canvas;
    this.normalizeCanvas();

    const gl = canvas.getContext("webgl");

    if (!gl) {
      throw new Error("Unable to init webgl");
    }

    this.webgl = gl;
	this.camera = camera;
  }

  public async init() {
	this.programInit();
	await this.initBuffers();

	this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
    this.webgl.clear(this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT);
    this.webgl.enable(this.webgl.DEPTH_TEST);
	this.webgl.depthFunc(this.webgl.LESS);
    this.webgl.enable(this.webgl.CULL_FACE);
    this.webgl.frontFace(this.webgl.CCW);
    this.webgl.cullFace(this.webgl.BACK);
  }

  public update(delta: number) {
	this.camera.update(delta);
	this.objects.forEach(engineObject => engineObject.object.update());

	this.updateView();
  }

  public updateView() {
	this.webgl.uniformMatrix4fv(this.viewLocation, false, this.camera.getView());
  }

  public addObject(object: Object) {
	const newObject: EngineObject = {
		object,
		vertices: new Float32Array(object.getVertices()),
		normals: new Float32Array(object.getNormals()),
		textureCoords: new Float32Array(object.getTextureCoords()),
		indices: new Uint16Array(object.getIndices()),
		texture: this.createObjectTexture(object.getImage())
	}

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
    this.webgl.clear(this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT);

	this.objects.forEach((engineObject) => {
		this.setVertexShaderBuffers(engineObject);

		this.webgl.drawElements(this.webgl.TRIANGLES, engineObject.indices.length, this.webgl.UNSIGNED_SHORT, 0);
	})

    document.getElementById("fps").innerHTML = `${this.fpsToDraw} fps`;

	requestAnimationFrame(this.run);
  }

// ---------private---------
  
  private canvas: HTMLCanvasElement | null = null;
  private webgl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;

  private transformationLocation: WebGLUniformLocation | null = null;
  private viewLocation: WebGLUniformLocation | null = null;

  private currentfps = 0; 
  private fpsToDraw = 0;
  private lastFpsUpdate = 0;
  private lastTime = 0;

  private vertexBuffer: WebGLBuffer = null;
  private textureCoordsBuffer: WebGLBuffer = null;
  private normalsBuffer: WebGLBuffer = null;
  private indicesBuffer: WebGLBuffer = null;
 
  private objects: EngineObject[] = [];
  private camera: Camera = null;

  private normalizeCanvas() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  private shaderInit(source: string, mode: WebGLRenderingContextBase["FRAGMENT_SHADER" | "VERTEX_SHADER"]): WebGLShader {
    const shader = this.webgl.createShader(mode);

    this.webgl.shaderSource(shader, source);

    this.webgl.compileShader(shader);

    if (!this.webgl.getShaderParameter(shader, this.webgl.COMPILE_STATUS)) {
      throw new Error("An error occurred compiling the shaders: " + this.webgl.getShaderInfoLog(shader));
    }

    return shader;
  }

  private programInit() {
    this.program = this.webgl.createProgram();
	const vertex = this.shaderInit(vertexShader, this.webgl.VERTEX_SHADER);
	const fragment = this.shaderInit(fragmentShader, this.webgl.FRAGMENT_SHADER);

    this.webgl.attachShader(this.program, vertex);
    this.webgl.attachShader(this.program, fragment);
    this.webgl.linkProgram(this.program);

    if (!this.webgl.getProgramParameter(this.program, this.webgl.LINK_STATUS)) {
      throw new Error("Unable to initialize the shader program");
    }

    this.webgl.useProgram(this.program);
  }

  private async initBuffers() {
	this.vertexBuffer = this.webgl.createBuffer();
	
	this.textureCoordsBuffer = this.webgl.createBuffer();

	this.normalsBuffer = this.webgl.createBuffer();

	this.indicesBuffer = this.webgl.createBuffer();

	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.vertexBuffer);
	const vertexAttributeLocation = this.webgl.getAttribLocation(this.program, "vertexPosition");
	this.webgl.vertexAttribPointer(
		vertexAttributeLocation, 
		3,
		this.webgl.FLOAT, false, 
		3 * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	this.webgl.enableVertexAttribArray(vertexAttributeLocation);

	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.normalsBuffer);
	const normalsAttributeLocation = this.webgl.getAttribLocation(this.program, "normals");
	this.webgl.vertexAttribPointer(
		normalsAttributeLocation, 
		3,
		this.webgl.FLOAT, true, 
		3 * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	this.webgl.enableVertexAttribArray(normalsAttributeLocation);

	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.textureCoordsBuffer);
	const vertexTextureLocation = this.webgl.getAttribLocation(this.program, "textureCoords");
	this.webgl.vertexAttribPointer(
		vertexTextureLocation, 
		2,
		this.webgl.FLOAT, false, 
		2 * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	this.webgl.enableVertexAttribArray(vertexTextureLocation);

	this.matrixInit();
  }

  private matrixInit() {
		this.viewLocation = this.webgl.getUniformLocation(this.program, "view");
		this.transformationLocation = this.webgl.getUniformLocation(this.program, "transformation");
		const projectionLocation = this.webgl.getUniformLocation(this.program, "projection");

		// this.world = new Float32Array(16);
		const projection = new Float32Array(16);

		// mat4.identity(this.world);
		mat4.perspective(
			projection, 
			glMatrix.toRadian(45), 
			this.canvas.width / this.canvas.height, 
			0.1, 1000.0
		);

		this.webgl.uniformMatrix4fv(this.viewLocation, false, this.camera.getView());
		// this.webgl.uniformMatrix4fv(this.worldLocation, false, this.world);
		this.webgl.uniformMatrix4fv(projectionLocation, false, projection);
  }

  private setVertexShaderBuffers(
		engineObject: EngineObject
	) {
		this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.vertexBuffer);
		this.webgl.bufferData(this.webgl.ARRAY_BUFFER, engineObject.vertices, this.webgl.DYNAMIC_DRAW);

	   this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.textureCoordsBuffer);
	   this.webgl.bufferData(this.webgl.ARRAY_BUFFER, engineObject.textureCoords, this.webgl.DYNAMIC_DRAW);
	   
	   this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.normalsBuffer);
	   this.webgl.bufferData(this.webgl.ARRAY_BUFFER, engineObject.normals, this.webgl.DYNAMIC_DRAW);

	   this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
	   this.webgl.bufferData(this.webgl.ELEMENT_ARRAY_BUFFER, engineObject.indices, this.webgl.DYNAMIC_DRAW);
	   
		this.webgl.uniformMatrix4fv(this.transformationLocation, false, engineObject.object.getMatrix());

	   this.webgl.bindTexture(this.webgl.TEXTURE_2D, engineObject.texture);
	   this.webgl.activeTexture(this.webgl.TEXTURE0);
	}

	private createObjectTexture(image: HTMLImageElement) {
		const texture = this.webgl.createTexture();
		this.webgl.bindTexture(this.webgl.TEXTURE_2D, texture);
		this.webgl.pixelStorei(this.webgl.UNPACK_FLIP_Y_WEBGL, true);
		this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_S, this.webgl.CLAMP_TO_EDGE);
		this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_T, this.webgl.CLAMP_TO_EDGE);
		this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR);
		this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.LINEAR);
		
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
}