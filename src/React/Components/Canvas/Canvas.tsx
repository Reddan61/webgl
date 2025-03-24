import { useEffect, useRef } from "react";
import { Engine } from "engine/Engine";
import { createSimpleScene } from "engine/Utils/scenes";
import { GizmoButtons } from "ui/Components/Canvas/GizmoButtons/GizmoButtons";

import styles from "./Canvas.module.scss";

export const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        (async function () {
            const canvas = canvasRef.current;

            if (!canvas) return;

            const scene = await createSimpleScene();

            await Engine.Init(canvas);
            Engine.setScene(scene);
            Engine.run();
        })();
    }, []);

    return (
        <div className={styles.container}>
            <GizmoButtons />
            <canvas ref={canvasRef} className={styles.canvas}></canvas>
        </div>
    );
};
