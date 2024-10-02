import { Uniform } from "./Uniform";

export class UniformMatrix4fv extends Uniform {
    public setData(data: Float32List) {
        this.webgl.uniformMatrix4fv(this.location, false, data);
    }
}
