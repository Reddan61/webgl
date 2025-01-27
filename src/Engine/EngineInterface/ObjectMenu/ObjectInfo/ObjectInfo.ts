import { Object } from "../../../Object";
import styles from "./ObjectInfo.module.scss";

type OnBackCbType = () => void;

export class ObjectInfo {
    private container: HTMLDivElement;
    private animationsUl: HTMLUListElement;

    private animationItems: HTMLLIElement[];

    constructor(onBack: OnBackCbType) {
        this.container = document.createElement("div");
        this.animationsUl = document.createElement("ul");
        this.animationsUl.classList.add(styles.animationList);

        const back = document.createElement("span");
        back.classList.add(styles.back);
        back.innerHTML = "Back";

        back.onclick = () => {
            onBack();
        };

        this.container.append(back);
        this.container.append(this.animationsUl);
    }

    public setObject(object: Object) {
        this.animationsUl.innerHTML = "";

        const currentAnimation = object.getCurrentAnimation();

        this.animationItems = object.getAnimations().map((animation) => {
            const li = document.createElement("li");
            li.classList.add(styles.animationItem);
            li.innerHTML = animation.getName();

            li.onclick = () => {
                this.animationItems.forEach((item) => {
                    item.classList.remove(styles.selected);
                });

                if (object.getCurrentAnimation() === animation) {
                    object.selectAnimation(null);
                    li.classList.remove(styles.selected);
                } else {
                    object.selectAnimation(animation);
                    li.classList.add(styles.selected);
                }
            };

            if (currentAnimation === animation) {
                li.classList.add(styles.selected);
            }

            this.animationsUl.append(li);

            return li;
        });
    }

    public getElement() {
        return this.container;
    }
}
