import { ChangeEvent, FC, memo, useEffect, useState } from "react";

import styles from "./Checkbox.module.scss";

interface IProps {
    value?: boolean;
    text?: string;
    onChange?: (bool: boolean) => void;
}

const CheckboxComponent: FC<IProps> = ({
    value = false,
    text = "",
    onChange: onChangeProp,
}) => {
    const [curValue, setCurValue] = useState(value);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setCurValue(newValue);
        onChangeProp?.(newValue);
    };

    useEffect(() => {
        setCurValue(value);
    }, [value]);

    return (
        <div className={styles.container}>
            <span>{text}</span>
            <input type="checkbox" checked={curValue} onChange={onChange} />
        </div>
    );
};

export const Checkbox = memo(CheckboxComponent);
