import { Canvas } from "ui/Components/Canvas/Canvas";
import { SideBar } from "ui/Components/SideBar/SideBar";

import styles from "./App.module.scss";

export const App = () => {
    return (
        <div className={styles.app}>
            <SideBar />
            <Canvas />
        </div>
    );
};
