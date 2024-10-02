import { Uniform } from "./Uniform";

export class Uniform3fv extends Uniform {
    public setData(data: Float32Array) {
        this.webgl.uniform3fv(this.location, data);
    }
}
