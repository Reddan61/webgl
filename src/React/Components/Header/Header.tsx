import { useEffect, useState } from "react";
import PlayIcon from "resources/svg/play.svg";
import PauseIcon from "resources/svg/pause.svg";
import { Engine } from "engine/Engine";
import { Render } from "engine/Render/Render";
import { MainRender } from "ui/Renders/MainRender";

import styles from "./Header.module.scss";

export const Header = () => {
    const [render, setRender] = useState<Render | null>(null);
    const [canClick, setCanClick] = useState(false);
    const [isPlaying, setPlaying] = useState(false);

    const onButtonClick = () => {
        const newPlaying = !isPlaying;
        setPlaying(newPlaying);

        if (newPlaying) {
            Engine.setRender(render);
        } else {
            Engine.setRender(null);
        }
    };

    useEffect(() => {
        const unsub = Engine.onInitSubcribe(() => {
            setRender(new MainRender(Engine.getCanvas()));
            setCanClick(true);
        });

        return () => {
            unsub();
        };
    }, []);

    return (
        <header className={styles.header}>
            <button
                className={styles.button}
                onClick={onButtonClick}
                disabled={!canClick}
            >
                <img
                    width={12}
                    height={12}
                    src={isPlaying ? PauseIcon : PlayIcon}
                />
            </button>
        </header>
    );
};
