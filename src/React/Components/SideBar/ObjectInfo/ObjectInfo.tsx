import { useEffect, useState } from "react";
import { Engine } from "engine/Engine";
import { EngineObject } from "engine/EngineObject";
import { TextInput } from "ui/Components/SideBar/ObjectInfo/TextInput/TextInput";
import { TransformationCollapse } from "ui/Components/SideBar/ObjectInfo/ObjectInfoCollapses/TransformationCollapse/TransformationCollapse";
import { BonesAnimationsCollapse } from "ui/Components/SideBar/ObjectInfo/ObjectInfoCollapses/BonesAnimationsCollapse/BonesAnimationCollapse";

import styles from "./ObjectInfo.module.scss";

export const ObjectInfo = () => {
    const [selectedObject, setSelectedObject] = useState<EngineObject | null>(
        null
    );

    useEffect(() => {
        let unsubChange: (() => void) | null = null;

        const unsubInit = Engine.onInitSubcribe(() => {
            unsubChange = Engine.getObjectSelector().addOnChange(
                ({ entity, lastSelected }) => {
                    setSelectedObject(
                        entity?.object ?? lastSelected?.object ?? null
                    );
                }
            );
        });

        return () => {
            unsubChange?.();
            unsubInit();
        };
    }, []);

    if (!selectedObject) {
        return <div className={styles.container}></div>;
    }

    return (
        <div className={styles.container}>
            <TextInput
                value={selectedObject?.getName()}
                onBlur={(value) => {
                    selectedObject?.setName(value);
                }}
            />
            <div className={styles.collapses}>
                <TransformationCollapse object={selectedObject} />
                <BonesAnimationsCollapse object={selectedObject} />
            </div>
        </div>
    );
};
