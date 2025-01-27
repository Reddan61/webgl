import styles from "./Switch.module.scss";

type OnChangeType = (value: boolean) => void;

export class Switch {
    private container: HTMLDivElement;
    private input: HTMLInputElement;
    private onChangeCb: OnChangeType | null;

    constructor(text: string, value = false) {
        this.container = document.createElement("div");
        this.container.classList.add(styles.switch);

        const span = document.createElement("span");
        span.innerHTML = text;

        this.input = document.createElement("input");
        this.input.setAttribute("type", "checkbox");

        this.input.checked = value;
        this.input.onchange = (e) => {
            const value = (e.target as HTMLInputElement).checked;

            this.input.blur();

            this.onChangeCb?.(value);
        };

        this.container.append(this.input);
        this.container.append(span);
    }

    public onChange(cb: OnChangeType | null) {
        this.onChangeCb = cb;
    }

    public getElement() {
        return this.container;
    }
}
