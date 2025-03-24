import { FC, memo, ReactNode, useState } from "react";

import styles from "./Collapse.module.scss";

interface IProps {
    title: string;
    children: ReactNode;
}

const CollapseComponent: FC<IProps> = ({ title, children }) => {
    const [isOpen, setOpen] = useState(false);

    const onTitleClick = () => {
        setOpen(!isOpen);
    };

    return (
        <div className={styles.container}>
            <div className={styles.title} onClick={onTitleClick}>
                <div
                    className={`${styles.arrow} ${isOpen ? styles.arrowOpened : ""}`}
                >
                    <div></div>
                    <div></div>
                </div>
                <span>{title}</span>
            </div>
            <div
                className={`${styles.content} ${isOpen ? styles.contentOpened : ""}`}
            >
                {children}
            </div>
        </div>
    );
};

export const Collapse = memo(CollapseComponent);
