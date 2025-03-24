import { Gizmo, GIZMO_TYPE_ENUM } from "engine/Gizmo/Gizmo";
import { Button } from "ui/Components/Canvas/GizmoButtons/Button/Button";
import MoveIcon from "resources/svg/move.svg";
import ScaleIcon from "resources/svg/scale.svg";
import RotateIcon from "resources/svg/rotate.svg";

import styles from "./GizmoButtons.module.scss";

export const GizmoButtons = () => {
    return (
        <div className={styles.container}>
            <Button
                type={GIZMO_TYPE_ENUM.TRANSLATION}
                iconUrl={MoveIcon}
                onClick={() => {
                    Gizmo.changeType(GIZMO_TYPE_ENUM.TRANSLATION);
                }}
            />
            <Button
                type={GIZMO_TYPE_ENUM.SCALE}
                iconUrl={ScaleIcon}
                onClick={() => {
                    Gizmo.changeType(GIZMO_TYPE_ENUM.SCALE);
                }}
            />
            <Button
                type={GIZMO_TYPE_ENUM.ROTATE}
                iconUrl={RotateIcon}
                onClick={() => {
                    Gizmo.changeType(GIZMO_TYPE_ENUM.ROTATE);
                }}
            />
        </div>
    );
};
