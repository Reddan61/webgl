export class Controls {
    private canvas: HTMLCanvasElement;

    private canSaveKeys = true;
    private keys: Record<KeyboardEvent["code"], boolean> = {};

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.focus();

        this.subscribe();
    }

    public getKey(key: KeyboardEvent["code"]) {
        return this.keys[key] ?? false;
    }

    private subscribe() {
        this.canvas.addEventListener("mousedown", () => {
            if (this.canSaveKeys) return;

            this.canvas.focus();
        });

        this.canvas.addEventListener("focus", () => {
            this.canSaveKeys = true;
        });

        this.canvas.addEventListener("blur", () => {
            this.canSaveKeys = false;
        });

        document.addEventListener("keydown", (e) => {
            if (!this.canSaveKeys) return;

            this.keys[e.code] = true;
        });

        document.addEventListener("keyup", (e) => {
            if (!this.canSaveKeys) return;

            this.keys[e.code] = false;
        });
    }
}
