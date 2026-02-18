import styles from "./InputField.module.css";

const InputField = ({
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  dataTestId,
  ...rest
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name}>{placeholder}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={dataTestId}
      {...rest}
    />
  </div>
);

export default InputField;
