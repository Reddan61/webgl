import { ChangeEvent, FC, memo, useEffect, useState } from "react";
import styles from "./NumberInput.module.scss";

interface IProps {
    value?: number;
    text?: string;
    onBlur?: (value: number) => void;
}

const notNumberRegex = /[^0-9\-\.]/g;

const NumberInputComponent: FC<IProps> = ({
    value = 0,
    text = "",
    onBlur: onBlurProp,
}) => {
    const [curValue, setCurValue] = useState(String(value));

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        let trimmedValue = e.target.value.trim();

        const replacedValue = trimmedValue.replace(notNumberRegex, "");

        setCurValue(replacedValue);
    };

    const onBlur = () => {
        let numberedValue = Number(curValue);

        if (isNaN(numberedValue) || !curValue.length) {
            numberedValue = 0;

            setCurValue(String(numberedValue));
        }

        onBlurProp?.(numberedValue);
    };

    useEffect(() => {
        setCurValue(String(value));
    }, [value]);

    return (
        <div className={styles.container}>
            <span>{text}</span>
            <input
                type="text"
                value={curValue}
                onChange={onChange}
                onBlur={onBlur}
                className={styles.input}
            />
        </div>
    );
};

export const NumberInput = memo(NumberInputComponent);
