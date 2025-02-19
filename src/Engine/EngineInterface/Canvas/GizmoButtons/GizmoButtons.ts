import { Button } from "engine/EngineInterface/Canvas/GizmoButtons/Button/Button";
import { GIZMO_TYPE_ENUM, Gizmo } from "engine/Gizmo/Gizmo";
import MoveIcon from "resources/svg/move.svg";
import ScaleIcon from "resources/svg/scale.svg";
import styles from "./GizmoButtons.module.scss";

export class GizmoButtons {
    private container: HTMLDivElement;
    private translationButton: Button;
    private scaleButton: Button;

    constructor() {
        this.container = document.createElement("div");
        this.container.classList.add(styles.container);

        this.translationButton = new Button(MoveIcon, () => {
            Gizmo.changeType(GIZMO_TYPE_ENUM.TRANSLATION);
        });
        this.scaleButton = new Button(ScaleIcon, () => {
            Gizmo.changeType(GIZMO_TYPE_ENUM.SCALE);
        });

        const gizmoType = Gizmo.getCurrentType();
        this.onChangeType(gizmoType);
        Gizmo.subscribeType(this.onChangeType);

        this.container.append(this.translationButton.getElement());
        this.container.append(this.scaleButton.getElement());
    }

    public getElement() {
        return this.container;
    }

    private onChangeType = (type: GIZMO_TYPE_ENUM) => {
        if (type === GIZMO_TYPE_ENUM.TRANSLATION) {
            this.translationButton.select(true);
            this.scaleButton.select(false);
        } else if (type === GIZMO_TYPE_ENUM.SCALE) {
            this.scaleButton.select(true);
            this.translationButton.select(false);
        }
    };
}
