import { SideBar } from "./SideBar/SideBar";
import { Canvas } from "./Canvas/Canvas";
import styles from "./EngineInterface.module.scss";

export class EngineInterface {
    private body: HTMLElement;
    private sideBar: SideBar;
    private canvas: Canvas;

    constructor(body: HTMLElement) {
        this.body = body;

        this.body.classList.add(styles.container);

        this.sideBar = new SideBar();
        this.canvas = new Canvas();

        this.body.append(this.sideBar.getElement());
        this.body.append(this.canvas.getElement());

        this.canvas.onDomInsert();
    }

    public getRenderWindow() {
        return this.canvas;
    }

    public update(fps: number) {
        this.sideBar.update(fps);
    }
}
