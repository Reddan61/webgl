import styles from "./FPSCounter.module.scss";

export class FPSCounter {
    private element: HTMLDivElement;
    private fps = 0;

    constructor() {
        const div = document.createElement("div");

        div.classList.add(styles.container);
        this.element = div;

        this.updateContent();
    }

    public getElement() {
        return this.element;
    }

    public update(fps: number) {
        if (this.fps !== fps) {
            this.fps = fps;
            this.updateContent();
        }
    }

    private updateContent() {
        this.element.innerHTML = `${this.fps} FPS`;
    }
}
