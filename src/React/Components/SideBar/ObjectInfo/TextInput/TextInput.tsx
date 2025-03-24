import { ChangeEvent, FC, memo, useEffect, useState } from "react";
import styles from "./TextInput.module.scss";

interface IProps {
    value?: string;
    onBlur?: (value: string) => void;
}

const TextInputComponent: FC<IProps> = ({ value = "", onBlur: onBlurProp }) => {
    const [curValue, setCurValue] = useState(value);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurValue(e.target.value);
    };

    const onBlur = () => {
        onBlurProp?.(curValue);
    };

    useEffect(() => {
        setCurValue(value);
    }, [value]);

    return (
        <input
            type="text"
            value={curValue}
            onChange={onChange}
            onBlur={onBlur}
            className={styles.input}
        />
    );
};

export const TextInput = memo(TextInputComponent);
