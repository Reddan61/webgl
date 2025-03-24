import { Canvas } from "ui/Components/Canvas/Canvas";
import { SideBar } from "ui/Components/SideBar/SideBar";
import { Header } from "ui/Components/Header/Header";

import styles from "./App.module.scss";

export const App = () => {
    return (
        <div className={styles.app}>
            <Header />
            <div className={styles.center}>
                <SideBar />
                <Canvas />
            </div>
        </div>
    );
};
