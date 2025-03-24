import { FC, useEffect, useState } from "react";
import { EngineObject } from "engine/EngineObject";
import { BoneAnimation } from "engine/Animation/BoneAnimation";
import { Collapse } from "ui/Components/SideBar/ObjectInfo/Collapsse/Collapse";

import styles from "./BonesAnimationCollapse.module.scss";

interface IProps {
    object: EngineObject;
}

export const BonesAnimationsCollapse: FC<IProps> = ({ object }) => {
    const [selectedAnimation, setSelectedAnimation] =
        useState<BoneAnimation | null>(null);
    const [animations, setAnimations] = useState<BoneAnimation[]>([]);

    const onAnimationClick = (animation: BoneAnimation) => () => {
        if (selectedAnimation === animation) {
            object.selectAnimation(null);
        } else {
            object.selectAnimation(animation);
        }

        setSelectedAnimation(object.getCurrentAnimation());
    };

    useEffect(() => {
        setSelectedAnimation(object.getCurrentAnimation());
        setAnimations([...object.getAnimations()]);
    }, [object]);

    return (
        <Collapse title="Bones animations">
            <ul className={styles.list}>
                {animations.map((animation, index) => {
                    return (
                        <li
                            key={index}
                            onClick={onAnimationClick(animation)}
                            className={`${styles.item} ${selectedAnimation === animation ? styles.selected : ""}`}
                        >
                            {animation.getName()}
                        </li>
                    );
                })}
            </ul>
        </Collapse>
    );
};
