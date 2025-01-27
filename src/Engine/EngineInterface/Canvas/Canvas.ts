import styles from "./Canvas.module.scss";

type NormalizeCallback = (width: number, height: number) => void;

export class Canvas {
    private canvas: HTMLCanvasElement;
    private container: HTMLDivElement;

    private normalizeCallback: NormalizeCallback | null;

    constructor() {
        this.container = document.createElement("div");
        this.canvas = document.createElement("canvas");

        this.container.classList.add(styles.container);
        this.canvas.classList.add(styles.canvas);

        this.container.append(this.canvas);

        this.subscribe();
    }

    public getElement() {
        return this.container;
    }

    public getRenderView() {
        return this.canvas;
    }

    public getSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
        };
    }

    public onNormalize(callback: NormalizeCallback | null) {
        this.normalizeCallback = callback;
    }

    public onDomInsert() {
        this.normalize();
    }

    private subscribe() {
        window.addEventListener("resize", () => {
            this.normalize();
        });
    }

    private normalize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.canvas.width = width;
        this.canvas.height = height;

        this.normalizeCallback?.(width, height);
    }
}
