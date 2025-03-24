import { FC, useEffect, useState } from "react";
import { Gizmo, GIZMO_TYPE_ENUM } from "engine/Gizmo/Gizmo";
import styles from "./Button.module.scss";

type OnClickType = () => void;

interface IProps {
    iconUrl: string;
    type: GIZMO_TYPE_ENUM;
    onClick: OnClickType;
}

export const Button: FC<IProps> = ({ iconUrl, type, onClick }) => {
    const [isSelected, setSelected] = useState(type === Gizmo.getCurrentType());

    useEffect(() => {
        const unsub = Gizmo.subscribeType((newType) => {
            setSelected(newType === type);
        });

        return () => {
            unsub();
        };
    }, []);

    return (
        <button
            type="button"
            className={`${styles.button} ${isSelected ? styles.selected : ""}`}
            onClick={onClick}
        >
            <img width={22} height={22} src={iconUrl} />
        </button>
    );
};
