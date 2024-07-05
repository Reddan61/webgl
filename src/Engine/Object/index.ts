import { mat4, vec3 } from "gl-matrix";

export class Object {
    constructor(
        position: vec3
    ) {
        this.position = position;

        mat4.fromTranslation(this.translation, this.position);
    }

    public getMatrix() {
        return this.matrix;
    }

    public update() {
        this.angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	    const identity = new Float32Array(16);
	    mat4.identity(identity);

	    mat4.rotate(this.yRotation, identity, this.angle, [0, 1, 0]);
	    mat4.rotate(this.xRotation, identity, this.angle, [1, 0, 0]);
	    mat4.mul(this.rotation, this.xRotation, this.yRotation);
        mat4.mul(this.matrix, this.translation, this.rotation);
    }

    private position: vec3 = null;
    private translation: mat4 = new Float32Array(16);
    private rotation: mat4 = new Float32Array(16); 
    private matrix:  mat4 = new Float32Array(16);
    private xRotation: mat4 = new Float32Array(16); 
    private yRotation: mat4 = new Float32Array(16); 
    private angle = 0;
}