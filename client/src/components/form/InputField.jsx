import styles from "./InputField.module.css";

const InputField = ({
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  dataTestId,
  label, // Added label prop support if needed, though currently placeholder is used as label
  ...rest // Capture other props like autoComplete, required, etc.
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name}>{label || placeholder}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={dataTestId}
      placeholder={placeholder} // Explicitly pass placeholder if not in rest, or let rest handle it? Rest handles it.
      {...rest}
    />
  </div>
);

export default InputField;
