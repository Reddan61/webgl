import { ObjectList } from "ui/Components/SideBar/ObjectList/ObjectList";
import { ObjectInfo } from "ui/Components/SideBar/ObjectInfo/ObjectInfo";
import styles from "./SideBar.module.scss";

export const SideBar = () => {
    return (
        <div className={styles.container}>
            <ObjectList />
            <ObjectInfo />
        </div>
    );
};
