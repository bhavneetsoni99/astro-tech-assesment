import styles from "./loadingSpinner.styles.module.css";

export const LoadingSpinner = () => (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>)
