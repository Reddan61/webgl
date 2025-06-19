import { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import { NumberInput } from "ui/Components/SideBar/ObjectInfo/NumberInput/NumberInput";

import styles from "./VectorInput.module.scss";

interface IProps {
    title: string;
    defaultValue: number[];
    axisText?: string[];
    onChange: (value: number[]) => void;
}

const DEFAULT_AXIS_TEXT = ["X", "Y", "Z"];

interface IPropsItem {
    value: number;
    index: number;
    text: string;
    onChange: (value: number, index: number) => void;
}

const VectorNumberItem: FC<IPropsItem> = memo(
    ({ index, value, text, onChange }) => {
        return (
            <NumberInput
                value={value}
                text={`${text}:`}
                onBlur={(value) => {
                    onChange(value, index);
                }}
            />
        );
    }
);

const VectorInputComponent: FC<IProps> = ({
    title,
    defaultValue,
    axisText = DEFAULT_AXIS_TEXT,
    onChange,
}) => {
    const [value, setValue] = useState(defaultValue);
    const valueRef = useRef(value);
    valueRef.current = value;

    const onValueBlur = useCallback(
        (newValue: number, index: number) => {
            const resultValue = [...valueRef.current];
            resultValue[index] = newValue;

            setValue(resultValue);

            onChange(resultValue);
        },
        [onChange]
    );

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <div className={styles.container}>
            <div className={styles.title}>{title}</div>
            <div className={styles.elements}>
                {value.map((_, index) => {
                    return (
                        <VectorNumberItem
                            key={index}
                            index={index}
                            text={axisText[index]}
                            value={value[index]}
                            onChange={onValueBlur}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const VectorInput = memo(VectorInputComponent, (prev, next) => {
    if (prev.onChange !== next.onChange || prev.title !== next.title)
        return false;

    if (prev.defaultValue.length !== next.defaultValue.length) return false;

    for (let i = 0; i < prev.defaultValue.length; i++) {
        if (prev.defaultValue[i] !== next.defaultValue[i]) {
            return false;
        }
    }

    return true;
});
