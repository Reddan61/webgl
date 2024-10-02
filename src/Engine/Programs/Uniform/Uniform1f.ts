import { Uniform } from "./Uniform";

export class Uniform1f extends Uniform {
    public setData(data: number) {
        this.webgl.uniform1f(this.location, data);
    }
}
