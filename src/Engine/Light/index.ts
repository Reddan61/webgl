import { unsubArr } from "engine/Utils/Utils";
import { vec3 } from "gl-matrix";

type Listener = () => unknown;

export class Light {
    private color: vec3;
    private bright: number;

    private onColorChangeSubscribers: Listener[] = [];
    private onBrightChangeSubscribers: Listener[] = [];

    constructor(color: vec3, bright: number) {
        this.color = color;
        this.bright = bright;
    }

    public getColor() {
        return this.color;
    }

    public getBright() {
        return this.bright;
    }

    public setColor(color: vec3) {
        this.color = color;

        this.colorChangePublic();
    }

    public setBright(bright: number) {
        this.bright = bright;

        this.brightChangePublic();
    }

    public onColorChangeSubscribe(cb: Listener) {
        this.onColorChangeSubscribers.push(cb);

        return unsubArr(this.onColorChangeSubscribers, (cur) => cur === cb);
    }

    public onBrightChangeSubscribe(cb: Listener) {
        this.onBrightChangeSubscribers.push(cb);

        return unsubArr(this.onBrightChangeSubscribers, (cur) => cur === cb);
    }

    private colorChangePublic() {
        this.onColorChangeSubscribers.forEach((cb) => cb());
    }

    private brightChangePublic() {
        this.onBrightChangeSubscribers.forEach((cb) => cb());
    }
}
