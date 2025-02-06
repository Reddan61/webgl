import { Engine } from "../../../Engine";
import { Object } from "../../../Object";
import { Scene } from "../../../Scene";

import styles from "./ObjectList.module.scss";

interface Item {
    object: Object;
    el: HTMLLIElement;
}
type OnClickItemTipe = (item: Item) => void;

export class ObjectList {
    private ul: HTMLUListElement;
    private objectList: Item[] = [];
    private onClickItem: OnClickItemTipe;

    constructor(onClickItem: OnClickItemTipe) {
        this.onClickItem = onClickItem;
        this.ul = document.createElement("ul");
        this.ul.classList.add(styles.list);

        this.setItems(Engine.getScene());
        Engine.onSetScene(this.onSetSceneSubscriber);

        Engine.getObjectSelector().addOnChange(({ entity }) => {
            this.objectList.forEach(({ el, object }) => {
                if (object === entity?.object) {
                    el.classList.add(styles.selected);
                } else {
                    el.classList.remove(styles.selected);
                }
            });
        });
    }

    private setItems(scene: Scene | null) {
        this.objectList = [];
        const objects = scene?.getObjects();

        this.ul.innerHTML = "";

        if (!objects) {
            return;
        }

        objects.forEach((object) => {
            const item = this.createItem(object);
            this.objectList.push(item);
            this.ul.append(item.el);
        });
    }

    private createItem(object: Object) {
        const li = document.createElement("li");

        li.classList.add(styles.item);
        li.innerHTML = object.getName();

        const item: Item = {
            el: li,
            object,
        };

        li.onclick = () => {
            this.onClickItem(item);
        };

        return item;
    }

    private onSetSceneSubscriber = (scene: Scene | null) => {
        this.setItems(scene);
    };

    public getElement() {
        return this.ul;
    }
}
