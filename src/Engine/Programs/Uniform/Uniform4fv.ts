import { Uniform } from "./Uniform";

export class Uniform4fv extends Uniform {
    public setData(data: Float32List) {
        this.webgl.uniform4fv(this.location, data);
    }
}
