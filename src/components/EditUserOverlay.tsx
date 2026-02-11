import { memo, type SyntheticEvent } from "react";
import { type User } from "./values";
import styles from "./EditUserOverlay.module.css";

// Extracted Overlay Component
interface EditUserOverlayProps {
  editingUser: User | null;
  formData: {
    name: string;
    city: string;
    profession: string;
  };
  onClose: () => void;
  onSubmit: (e: SyntheticEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditUserOverlay = memo(
  ({
    editingUser,
    formData,
    onClose,
    onSubmit,
    onInputChange,
  }: EditUserOverlayProps) => {
    if (!editingUser) return null;

    return (
      <div className={styles.overlay}>
        <div className={styles.container}>
          <h3 className={styles.title}>Edit User (ID: {editingUser.id})</h3>

          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>City:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={onInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroupLarge}>
              <label className={styles.label}>Profession:</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={onInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton}>
                Save Changes
              </button>

              <button
                type="button"
                onClick={onClose}
                className={styles.closeButton}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);