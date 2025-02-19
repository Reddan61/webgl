import styles from "./Button.module.scss";

type OnClickType = () => void;

export class Button {
    private button: HTMLButtonElement;

    constructor(iconUrl: string, onClick: OnClickType) {
        this.button = document.createElement("button");
        this.button.classList.add(styles.button);
        this.button.setAttribute("type", "button");

        const iconImg = document.createElement("img");
        iconImg.setAttribute("src", iconUrl);

        this.button.append(iconImg);
        this.button.onclick = onClick;
    }

    public getElement() {
        return this.button;
    }

    public select(isSelect: boolean) {
        if (isSelect) {
            this.button.classList.add(styles.selected);
        } else {
            this.button.classList.remove(styles.selected);
        }
    }
}
