import { FC, useEffect, useState } from "react";
import { Engine } from "engine/Engine";
import { EngineObject } from "engine/EngineObject";

import styles from "./ObjectList.module.scss";

interface IItemProps {
    object: EngineObject;
    isSelected: boolean;
}

const Item: FC<IItemProps> = ({ isSelected, object }) => {
    const [name, setName] = useState(object.getName());

    useEffect(() => {
        const unsub = object.onNameUpdate((newName) => {
            setName(newName);
        });

        return () => {
            unsub();
        };
    }, []);

    return (
        <li
            className={`${styles.item} ${isSelected ? styles.selected : ""}`}
            onClick={() => {
                Engine.getObjectSelector()?.setSelect(object);
            }}
        >
            {name}
        </li>
    );
};

export const ObjectList = () => {
    const [selectedObject, setSelectedObject] = useState<EngineObject | null>(
        null
    );
    const [objects, setObjects] = useState<EngineObject[]>([]);

    useEffect(() => {
        const unsubScene = Engine.onSetScene((scene) => {
            if (!scene) {
                setObjects([]);
                return;
            }

            setObjects(scene.getObjects());
        });

        let unsubChange: (() => void) | null = null;

        const unsubInit = Engine.onInitSubcribe(() => {
            unsubChange = Engine.getObjectSelector().addOnChange(
                ({ entity }) => {
                    setSelectedObject(entity?.object ?? null);
                }
            );
        });

        return () => {
            unsubScene();
            unsubChange?.();
            unsubInit();
        };
    }, []);

    return (
        <div className={styles.container}>
            <h1>Scene objects:</h1>
            <ul className={styles.list}>
                {objects.map((object, index) => {
                    return (
                        <Item
                            key={index}
                            isSelected={selectedObject === object}
                            object={object}
                        />
                    );
                })}
            </ul>
        </div>
    );
};
