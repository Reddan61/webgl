import { ObjectInfo } from "./ObjectInfo/ObjectInfo";
import { ObjectList } from "./ObjectList/ObjectList";

import styles from "./ObjectMenu.module.scss";

export class ObjectMenu {
    private container: HTMLDivElement;

    private objectList: ObjectList;
    private objectInfo: ObjectInfo;

    constructor() {
        this.container = document.createElement("div");
        this.container.classList.add(styles.container);

        this.objectList = new ObjectList(({ object }) => {
            this.container.innerHTML = "";
            this.objectInfo.setObject(object);
            this.container.append(this.objectInfo.getElement());
        });

        this.objectInfo = new ObjectInfo(() => {
            this.container.innerHTML = "";
            this.container.append(this.objectList.getElement());
        });

        this.container.append(this.objectList.getElement());
    }

    public getElement() {
        return this.container;
    }
}
