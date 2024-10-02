import { mat3 } from "gl-matrix";
import { Uniform } from "./Uniform";

export class UniformMatrix3fv extends Uniform {
    public setData(data: mat3) {
        this.webgl.uniformMatrix3fv(this.location, false, data);
    }
}
