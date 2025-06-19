import { vec3 } from "gl-matrix";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EngineObject } from "engine/EngineObject";
import { Collapse } from "ui/Components/SideBar/ObjectInfo/Collapsse/Collapse";
import { VectorInput } from "ui/Components/SideBar/ObjectInfo/VectorInput/VectorInput";
import { NumberInput } from "ui/Components/SideBar/ObjectInfo/NumberInput/NumberInput";
import { PointLight } from "engine/Light/PointLight";

import styles from "./PointLightCollapse.module.scss";
import { Checkbox } from "ui/Components/SideBar/ObjectInfo/Checkbox/Checkbox";

interface IProps {
    object: EngineObject;
}

interface IOptions {
    withShadow: boolean;
    bright: number;
    color: number[];
}

const createOptions = (pointLight: PointLight | null): IOptions | null => {
    if (!pointLight) return null;

    return {
        withShadow: pointLight.getWithShadow(),
        bright: pointLight.getBright(),
        color: [...pointLight.getColor()],
    };
};

const getLightFromObject = (object: EngineObject) => {
    const meshes = object.getMeshes();

    for (let i = 0; i < meshes.length; i++) {
        const curMesh = meshes[i];
        const light = curMesh.getLight();

        if (light) return light;
    }

    return null;
};

export const PointLightCollapse: FC<IProps> = ({ object }) => {
    const pointLight = useMemo(() => {
        return getLightFromObject(object);
    }, [object]);

    const [options, setOptions] = useState<IOptions | null>(
        createOptions(pointLight)
    );

    const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pointLightRef = useRef<PointLight | null>(null);

    pointLightRef.current = pointLight;

    const onChangeColor = useCallback((value: number[]) => {
        pointLightRef.current?.setColor(value as vec3);
    }, []);

    const onChangeBright = useCallback((value: number) => {
        pointLightRef.current?.setBright(value);
    }, []);

    const onChangeWithShadow = useCallback((value: boolean) => {
        pointLightRef.current?.setWithShadow(value);
    }, []);

    useEffect(() => {
        const onChange = () => {
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }

            throttleRef.current = setTimeout(() => {
                setOptions(createOptions(pointLightRef.current));
            }, 20);
        };

        const unsubWithShadow = pointLight?.subscribeWithShadowUpdate(onChange);
        const unsubBright = pointLight?.onBrightChangeSubscribe(onChange);
        const unsubColor = pointLight?.onColorChangeSubscribe(onChange);

        return () => {
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }

            unsubWithShadow?.();
            unsubBright?.();
            unsubColor?.();
        };
    }, [pointLight]);

    useEffect(() => {
        setOptions(createOptions(pointLight));
    }, [pointLight]);

    if (!options) return null;

    return (
        <Collapse title="Point light">
            <div className={styles.container}>
                <Checkbox
                    text="Enable shadows:"
                    value={options.withShadow}
                    onChange={onChangeWithShadow}
                />
                <NumberInput
                    text="Bright:"
                    value={options.bright}
                    onBlur={onChangeBright}
                />
                <VectorInput
                    title="Color"
                    axisText={["R", "G", "B"]}
                    defaultValue={options.color}
                    onChange={onChangeColor}
                />
            </div>
        </Collapse>
    );
};
