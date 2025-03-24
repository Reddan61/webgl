import { vec3 } from "gl-matrix";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { EngineObject } from "engine/EngineObject";
import { Transform } from "engine/Transform/Transform";
import { Collapse } from "ui/Components/SideBar/ObjectInfo/Collapsse/Collapse";
import { VectorInput } from "ui/Components/SideBar/ObjectInfo/VectorInput/VectorInput";

import styles from "./TransformationCollapse.module.scss";

interface IProps {
    object: EngineObject;
}

interface IOptions {
    position: number[];
    scaling: number[];
    rotation: number[];
}

const createOptions = (transform: Transform): IOptions => {
    const rotation = transform.getRotation();

    return {
        position: [...transform.getPosition()],
        scaling: [...transform.getScaling()],
        rotation: [...rotation.getEulerAngles()],
    };
};

export const TransformationCollapse: FC<IProps> = ({ object }) => {
    const [options, setOptions] = useState<IOptions>(
        createOptions(object.getTransform())
    );

    const objectRef = useRef(object);
    objectRef.current = object;

    const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onChangePosition = useCallback((value: number[]) => {
        objectRef.current.getTransform().setPosition(value as vec3);
    }, []);

    const onChangeScaling = useCallback((value: number[]) => {
        objectRef.current.getTransform().setScaling(value as vec3);
    }, []);

    const onChangeRotation = useCallback((value: number[]) => {
        objectRef.current
            .getTransform()
            .getRotation()
            .rotate(...value);
    }, []);

    useEffect(() => {
        const transform = object.getTransform();

        const unsubTransform = transform.subscribe((newTransform) => {
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }

            throttleRef.current = setTimeout(() => {
                setOptions(createOptions(newTransform));
            }, 20);
        });

        return () => {
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }

            unsubTransform();
        };
    }, [object]);

    useEffect(() => {
        setOptions(createOptions(object.getTransform()));
    }, [object]);

    return (
        <Collapse title="Transformation">
            <div className={styles.container}>
                <VectorInput
                    title="Position"
                    defaultValue={options.position}
                    onChange={onChangePosition}
                />
                <VectorInput
                    title="Scaling"
                    defaultValue={options.scaling}
                    onChange={onChangeScaling}
                />
                <VectorInput
                    title="Rotation"
                    defaultValue={options.rotation}
                    onChange={onChangeRotation}
                />
            </div>
        </Collapse>
    );
};
