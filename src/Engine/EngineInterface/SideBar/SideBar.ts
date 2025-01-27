import { ObjectMenu } from "./../ObjectMenu/ObjectMenu";
import { FPSCounter } from "./../FPSCounter/FPSCounter";
import { Switches } from "../Switches/Switches";

import styles from "./SideBar.module.scss";

export class SideBar {
    private element: HTMLDivElement;
    private fpsCounter: FPSCounter;
    private switches: Switches;
    private objectMenu: ObjectMenu;

    constructor() {
        this.fpsCounter = new FPSCounter();
        this.switches = new Switches();
        this.objectMenu = new ObjectMenu();

        this.element = document.createElement("div");

        this.element.classList.add(styles.container);

        this.element.append(this.fpsCounter.getElement());
        this.element.append(this.switches.getElement());
        this.element.append(this.objectMenu.getElement());
    }

    public getElement() {
        return this.element;
    }

    public update(fps: number) {
        this.fpsCounter.update(fps);
    }
}
