import { Uniform } from "./Uniform";

export class Uniform1i extends Uniform {
    public setData(data: number) {
        this.webgl.uniform1i(this.location, data);
    }
}
