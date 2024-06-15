import { glMatrix, mat4 } from "gl-matrix"
import susanTexture from "../../resources/SusanTexture.png"
import susan from "../../resources/Susan.json"

import { Camera } from './Camera/Camera';
import { loadImage } from './Utils/Utils';

import { vertexShader } from "./shaders/vertex";
import { fragmentShader } from "./shaders/fragment"

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
    this.webgl.enable(this.webgl.CULL_FACE);
    this.webgl.frontFace(this.webgl.CCW);
    this.webgl.cullFace(this.webgl.BACK);
  }

  public update() {
	this.camera.update();

	this.updateView();
  }

  public updateView() {
	this.webgl.uniformMatrix4fv(this.viewLocation, false, this.camera.getView());
  }

  public run = () => {
	this.angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	const identity = new Float32Array(16);
	mat4.identity(identity);

	mat4.rotate(this.yRotation, identity, this.angle, [0, 1, 0]);
	mat4.rotate(this.xRotation, identity, this.angle, [1, 0, 0]);
	mat4.mul(this.world, this.xRotation, this.yRotation);

	this.update();

	this.webgl.uniformMatrix4fv(this.worldLocation, false, this.world);
	
	this.webgl.clearColor(0.75, 0.85, 0.8, 1.0);
    this.webgl.clear(this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT);

	this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.texture);
	this.webgl.activeTexture(this.webgl.TEXTURE0);

	this.webgl.drawElements(this.webgl.TRIANGLES, this.indices.length, this.webgl.UNSIGNED_SHORT, 0);

	requestAnimationFrame(this.run);
  }

// ---------private---------
  
  private canvas: HTMLCanvasElement | null = null;
  private webgl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;

  private world: Float32Array | null = null; 
  private worldLocation: WebGLUniformLocation | null = null;
  private viewLocation: WebGLUniformLocation | null = null;
  private xRotation: Float32Array = new Float32Array(16); 
  private yRotation: Float32Array = new Float32Array(16); 
  private angle = 0;

  private texture: WebGLTexture = null;

  private camera: Camera = null;

  private readonly vertices = susan.meshes[0].vertices;
  private readonly indices = susan.meshes[0].faces.flat(Infinity);
  private readonly textureCoords = susan.meshes[0].texturecoords[0];
  private readonly normals = susan.meshes[0].normals;

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
	const vertexBuffer = this.webgl.createBuffer();
	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, vertexBuffer);
	this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array(this.vertices), this.webgl.STATIC_DRAW);
	
	const textureCoordsBuffer = this.webgl.createBuffer();
	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, textureCoordsBuffer);
	this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array(this.textureCoords), this.webgl.STATIC_DRAW);

	const normalsBuffer = this.webgl.createBuffer();
	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, normalsBuffer);
	this.webgl.bufferData(this.webgl.ARRAY_BUFFER, new Float32Array(this.normals), this.webgl.STATIC_DRAW);

	const indicesBuffer = this.webgl.createBuffer();
	this.webgl.bindBuffer(this.webgl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
	this.webgl.bufferData(this.webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.webgl.STATIC_DRAW);

	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, vertexBuffer);
	const vertexAttributeLocation = this.webgl.getAttribLocation(this.program, "vertexPosition");
	this.webgl.vertexAttribPointer(
		vertexAttributeLocation, 
		3,
		this.webgl.FLOAT, false, 
		3 * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	this.webgl.enableVertexAttribArray(vertexAttributeLocation);

	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, normalsBuffer);
	const normalsAttributeLocation = this.webgl.getAttribLocation(this.program, "normals");
	this.webgl.vertexAttribPointer(
		normalsAttributeLocation, 
		3,
		this.webgl.FLOAT, true, 
		3 * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	this.webgl.enableVertexAttribArray(normalsAttributeLocation);

	this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, textureCoordsBuffer);
	const vertexTextureLocation = this.webgl.getAttribLocation(this.program, "textureCoords");
	this.webgl.vertexAttribPointer(
		vertexTextureLocation, 
		2,
		this.webgl.FLOAT, false, 
		2 * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	this.webgl.enableVertexAttribArray(vertexTextureLocation);

	this.texture = this.webgl.createTexture();
	this.webgl.bindTexture(this.webgl.TEXTURE_2D, this.texture);
	this.webgl.pixelStorei(this.webgl.UNPACK_FLIP_Y_WEBGL, true);
	this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_S, this.webgl.CLAMP_TO_EDGE);
	this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_WRAP_T, this.webgl.CLAMP_TO_EDGE);
	this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MIN_FILTER, this.webgl.LINEAR);
	this.webgl.texParameteri(this.webgl.TEXTURE_2D, this.webgl.TEXTURE_MAG_FILTER, this.webgl.LINEAR);
	const image = await loadImage(susanTexture);
	this.webgl.texImage2D(
		this.webgl.TEXTURE_2D, 0, this.webgl.RGBA, this.webgl.RGBA,
		this.webgl.UNSIGNED_BYTE,
		image
	);
	this.webgl.bindTexture(this.webgl.TEXTURE_2D, null);

	this.matrixInit();
  }

  private matrixInit() {
		this.viewLocation = this.webgl.getUniformLocation(this.program, "view");
		this.worldLocation = this.webgl.getUniformLocation(this.program, "world");
		const projectionLocation = this.webgl.getUniformLocation(this.program, "projection");

		this.world = new Float32Array(16);
		const projection = new Float32Array(16);


		mat4.identity(this.world);
		mat4.perspective(
			projection, 
			glMatrix.toRadian(45), 
			this.canvas.width / this.canvas.height, 
			0.1, 1000.0
		);

		this.webgl.uniformMatrix4fv(this.viewLocation, false, this.camera.getView());
		this.webgl.uniformMatrix4fv(this.worldLocation, false, this.world);
		this.webgl.uniformMatrix4fv(projectionLocation, false, projection);
  }
}